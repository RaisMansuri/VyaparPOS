import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuthService, AuthUser } from '../../../auth/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { UserSubscription, SubscriptionPlan } from '../../../models/subscription.model';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, DatePipe, ButtonModule, TagModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private orderService = inject(OrderService);
    private subscriptionService = inject(SubscriptionService);
    private router = inject(Router);
    private userService = inject(UserService);
    private toastService = inject(ToastService);

    user: AuthUser | null = null;
    uploading = false;
    totalOrders = 0;
    totalSpent = 0;
    currentSubscription: UserSubscription | null = null;
    currentPlan: SubscriptionPlan | null = null;

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.user = user || {
                id: 'guest',
                name: 'Guest User',
                email: 'guest@example.com',
                phone: '+91 0000000000',
                address: '123 Main Street',
                city: 'Metropolis',
                state: 'State',
                pincode: '000000',
                joinDate: new Date().toISOString()
            };
        });

        // Fetch latest profile data from server
        this.authService.getProfile().subscribe();


        const orders = this.orderService.getOrders();
        this.totalOrders = orders.length;
        this.totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        this.subscriptionService.currentSubscription$.subscribe(subscription => {
            this.currentSubscription = subscription;
            this.currentPlan = this.subscriptionService.getPlan(subscription.planId);
        });
    }

    getInitials(): string {
        if (!this.user?.name) return '?';
        return this.user.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    getMemberSince(): string {
        if (this.user?.joinDate) {
            return this.user.joinDate;
        }
        return new Date().toISOString();
    }

    editProfile(): void {
        this.router.navigate(['/profile/edit']);
    }

    viewOrders(): void {
        this.router.navigate(['/orders']);
    }

    manageSubscription(): void {
        this.router.navigate(['/settings/subscription']);
    }

    getSubscriptionSeverity(): "success" | "warn" | "info" {
        if (this.currentSubscription?.status === 'active') return 'success';
        if (this.currentSubscription?.status === 'canceled') return 'warn';
        return 'info';
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.uploadAvatar(file);
        }
    }

    private uploadAvatar(file: File): void {
        this.uploading = true;
        this.userService.uploadAvatar(file)
            .pipe(finalize(() => this.uploading = false))
            .subscribe({
                next: (res: any) => {
                    const url = res.data.url;
                    this.authService.updateProfile({ avatarUrl: url }).subscribe({
                        next: () => this.toastService.success('Success', 'Profile picture updated'),
                        error: (err: any) => this.toastService.error('Error', 'Failed to update profile')
                    });
                },
                error: (err: any) => {
                    this.toastService.error('Upload Failed', err.error?.message || 'Failed to upload image');
                }
            });
    }
}

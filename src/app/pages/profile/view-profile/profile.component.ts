import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuthService, AuthUser } from '../../../auth/auth.service';
import { OrderService } from '../../../core/services/order.service';

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
    private router = inject(Router);

    user: AuthUser | null = null;
    totalOrders = 0;
    totalSpent = 0;

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

        const orders = this.orderService.getOrders();
        this.totalOrders = orders.length;
        this.totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
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
}

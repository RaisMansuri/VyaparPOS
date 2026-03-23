import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService, AuthUser } from '../../../auth/auth.service';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule],
    providers: [],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    form = {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        aiApiKey: '',
        aiModel: 'google/gemini-2.0-flash-lite-preview-02-05:free'
    };

    isSaving = false;

    states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
    ];

    ngOnInit(): void {
        const user = this.authService.getCurrentUser() || {
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
        if (user) {
            this.form.name = user.name || '';
            this.form.email = user.email || '';
            this.form.phone = user.phone || '';
            this.form.address = user.address || '';
            this.form.city = user.city || '';
            this.form.state = user.state || '';
            this.form.pincode = user.pincode || '';
            this.form.aiApiKey = user.aiApiKey || '';
            this.form.aiModel = user.aiModel || 'google/gemini-2.0-flash-lite-preview-02-05:free';
        }
    }

    getInitials(): string {
        if (!this.form.name) return '?';
        return this.form.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    saveProfile(): void {
        if (!this.form.name.trim() || !this.form.phone.trim()) {
            this.toastService.warn('Required', 'Name and Phone are required fields');
            return;
        }

        this.isSaving = true;

        this.authService.updateProfile({
            name: this.form.name.trim(),
            email: this.form.email.trim(),
            phone: this.form.phone.trim(),
            address: this.form.address.trim(),
            city: this.form.city.trim(),
            state: this.form.state,
            pincode: this.form.pincode.trim(),
            aiApiKey: this.form.aiApiKey.trim(),
            aiModel: this.form.aiModel
        }).subscribe({
            next: () => {
                this.isSaving = false;
                this.toastService.success('Profile Updated!', 'Your profile has been saved successfully');
                setTimeout(() => {
                    this.router.navigate(['/profile']);
                }, 1000);
            },
            error: (err) => {
                this.isSaving = false;
                this.toastService.error('Update Failed', 'Could not save profile changes');
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/profile']);
    }
}

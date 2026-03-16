import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, AuthUser } from '../../../auth/auth.service';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, ToastModule],
    providers: [MessageService],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    form = {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
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
            this.messageService.add({
                severity: 'warn',
                summary: 'Required',
                detail: 'Name and Phone are required fields'
            });
            return;
        }

        this.isSaving = true;

        setTimeout(() => {
            this.authService.updateProfile({
                name: this.form.name.trim(),
                email: this.form.email.trim(),
                phone: this.form.phone.trim(),
                address: this.form.address.trim(),
                city: this.form.city.trim(),
                state: this.form.state,
                pincode: this.form.pincode.trim()
            });

            this.isSaving = false;
            this.messageService.add({
                severity: 'success',
                summary: 'Profile Updated!',
                detail: 'Your profile has been saved successfully',
                life: 3000
            });

            setTimeout(() => {
                this.router.navigate(['/profile']);
            }, 1000);
        }, 800);
    }

    cancel(): void {
        this.router.navigate(['/profile']);
    }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
    selector: 'app-address',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule,
        SelectButtonModule, SelectModule, FloatLabelModule
    ],
    templateUrl: './address.component.html',
    styleUrl: './address.component.css'
})
export class AddressComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private orderService = inject(OrderService);
    cartService = inject(CartService);

    addressTypes = [
        { label: 'Home', value: 'home', icon: 'pi pi-home' },
        { label: 'Office', value: 'office', icon: 'pi pi-building' }
    ];

    states: string[] = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Chandigarh', 'Puducherry'
    ];

    addressForm: FormGroup = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        addressLine1: ['', [Validators.required]],
        addressLine2: [''],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        addressType: ['home', [Validators.required]]
    });

    ngOnInit(): void {
        // Redirect if cart is empty
        if (this.cartService.items().length === 0) {
            this.router.navigate(['/cart']);
            return;
        }
        // Pre-fill if address was previously set
        const savedAddr = this.orderService.getAddress();
        if (savedAddr) {
            this.addressForm.patchValue(savedAddr);
        }
    }

    onSubmit(): void {
        if (this.addressForm.valid) {
            this.orderService.setAddress(this.addressForm.value);
            this.router.navigate(['/checkout/payment']);
        } else {
            this.addressForm.markAllAsTouched();
        }
    }

    goBack(): void {
        this.router.navigate(['/cart']);
    }

    isInvalid(field: string): boolean {
        const control = this.addressForm.get(field);
        return !!(control && control.invalid && control.touched);
    }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required]],
  });

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get phone() { return this.form.get('phone'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const email = this.form.get('email')?.value;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.toastService.success('Registration Successful', 'Please verify your email to continue.');
        this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
      },
      error: (err) => {
        const msg = err.error?.message || 'Registration failed. Please try again.';
        this.toastService.error('Registration Failed', msg);
      },
    });
  }
}


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
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  passwordVisible: boolean = false;

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const email = this.form.get('email')?.value;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.toastService.success('Login Successful', 'Welcome back to VyaparPOS!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.error?.unverified || err.error?.message?.toLowerCase().includes('verify')) {
          this.toastService.warn('Email Unverified', 'Please verify your email to log in.');
          this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
        } else {
          const msg = err.error?.message || 'Invalid credentials. Please try again.';
          this.toastService.error('Login Failed', msg);
        }
      },
    });
  }
}


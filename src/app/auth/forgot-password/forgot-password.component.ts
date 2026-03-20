import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    PasswordModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand">
            <i class="pi pi-shopping-cart brand-icon"></i>
            <span class="brand-name">VyaparPOS</span>
          </div>
          <h1>{{ step === 1 ? 'Forgot Password?' : 'Reset Password' }}</h1>
          <p class="subtitle">
            {{ step === 1 
              ? 'Enter your email to receive a password reset code.' 
              : 'Enter the 6-digit code and your new password.' }}
          </p>
        </div>

        <form (ngSubmit)="step === 1 ? requestOTP() : handleReset()">
          <div class="form-content">
            <!-- Step 1: Email -->
            <div *ngIf="step === 1" class="field-group animate-in">
              <p-floatLabel>
                <input pInputText id="email" type="email" name="email" 
                       [(ngModel)]="email" required autocomplete="email" />
                <label for="email">Email Address</label>
              </p-floatLabel>
            </div>

            <!-- Success Message for Step 2 -->
            <div *ngIf="step === 2" class="success-banner animate-in">
              <i class="pi pi-check-circle"></i>
              <span>Verification code sent to <strong>{{ email }}</strong></span>
            </div>

            <!-- Step 2: OTP & New Password -->
            <div *ngIf="step === 2" class="animate-in">
              <div class="field-group">
                <p-floatLabel>
                  <input pInputText id="otp" type="text" name="otp" 
                         [(ngModel)]="otp" required maxlength="6" />
                  <label for="otp">Verification Code</label>
                </p-floatLabel>
              </div>

              <div class="field-group">
                <p-floatLabel>
                  <p-password id="password" name="password" 
                            [(ngModel)]="password" [toggleMask]="true" 
                            [feedback]="true" [style]="{'width':'100%'}"
                            [inputStyle]="{'width':'100%'}"></p-password>
                  <label for="password">New Password</label>
                </p-floatLabel>
              </div>

              <div class="field-group">
                <p-floatLabel>
                  <p-password id="confirmPassword" name="confirmPassword" 
                            [(ngModel)]="confirmPassword" [toggleMask]="true" 
                            [feedback]="false" [style]="{'width':'100%'}"
                            [inputStyle]="{'width':'100%'}"></p-password>
                  <label for="confirmPassword">Confirm New Password</label>
                </p-floatLabel>
              </div>
            </div>
            
            <div class="actions-row">
              <a routerLink="/auth/login" class="back-link">
                <i class="pi pi-arrow-left"></i> Back to Login
              </a>
              <button pButton type="submit" [label]="step === 1 ? 'Send Code' : 'Reset Password'" 
                      [loading]="loading" class="submit-btn" [style]="{'padding': '10px 25px'}"></button>
            </div>
            
            <div *ngIf="step === 2" class="auth-footer">
              <p class="resend-text">
                Didn't receive code? <a (click)="requestOTP()" class="resend-link">Resend</a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 25px;
    }

    .brand-icon {
      font-size: 1.5rem;
      background: rgba(33, 150, 243, 0.1);
      color: #2196F3;
      padding: 12px;
      border-radius: 12px;
    }

    .brand-name {
      font-size: 1.5rem;
      font-weight: 800;
      color: #333;
      letter-spacing: -1px;
    }

    h1 {
      font-weight: 700;
      color: #333;
      margin: 0 0 10px;
      font-size: 24px;
    }

    .subtitle {
      color: #666;
      font-size: 14px;
    }

    .field-group {
      margin-bottom: 25px;
    }

    .success-banner {
      background: #e3f2fd;
      color: #1976d2;
      padding: 12px 15px;
      border-radius: 10px;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      border: 1px solid #bbdefb;
    }

    .success-banner i {
      font-size: 1.2rem;
    }

    .reset-fields {
      margin-top: 10px;
    }

    ::ng-deep .p-float-label {
      width: 100%;
    }

    ::ng-deep input.p-inputtext {
      width: 100% !important;
      padding: 12px !important;
      border-radius: 10px !important;
    }

    .actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
    }

    .submit-btn {
      border-radius: 10px;
      font-weight: 600;
      background-color: #00b894 !important;
      border-color: #00b894 !important;
    }

    .auth-footer {
      margin-top: 20px;
      text-align: center;
    }

    .back-link {
      color: #7f8c8d;
      text-decoration: none;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #2c3e50;
    }

    .resend-text {
      font-size: 13px;
      color: #666;
    }

    .resend-link {
      color: #2196F3;
      font-weight: 600;
      cursor: pointer;
    }

    .animate-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email: string = '';
  otp: string = '';
  password: string = '';
  confirmPassword: string = '';
  step: number = 1;
  loading: boolean = false;

  requestOTP() {
    if (!this.email) {
      this.toastService.error('Error', 'Please enter your email address');
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.toastService.success('Success', 'Verification code sent to your email');
        this.step = 2;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Error', err.error?.message || 'Failed to send verification code');
        this.loading = false;
      }
    });
  }

  handleReset() {
    if (!this.otp || !this.password || !this.confirmPassword) {
      this.toastService.error('Error', 'All fields are required');
      return;
    }

    if (this.otp.length !== 6) {
      this.toastService.error('Error', 'Please enter 6-digit verification code');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.error('Error', 'Passwords do not match');
      return;
    }

    this.loading = true;
    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.password
    }).subscribe({
      next: () => {
        this.toastService.success('Success', 'Password reset successfully');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.toastService.error('Error', err.error?.message || 'Failed to reset password');
        this.loading = false;
      }
    });
  }
}

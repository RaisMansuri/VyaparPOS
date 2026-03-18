import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../auth.service';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputOtpModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4)]]
  });

  email: string = '';
  loading = false;
  
  // Timer related properties
  countdown = 120; // 120 seconds
  timerDisplay = '02:00';
  canResend = false;
  private timerSubscription?: Subscription;

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.countdown = 120;
    this.canResend = false;
    this.updateTimerDisplay();

    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.countdown > 0))
      .subscribe({
        next: () => {
          this.countdown--;
          this.updateTimerDisplay();
          if (this.countdown === 0) {
            this.canResend = true;
          }
        }
      });
  }

  private stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private updateTimerDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const otp = this.form.get('otp')?.value;

    this.auth.verifyEmail(this.email, otp).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Email verified successfully. You can now login.'
        });
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Verification failed. Please check your code.'
        });
      }
    });
  }

  resendCode() {
    if (!this.canResend) return;
    
    this.auth.resendVerification(this.email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Sent',
          detail: 'A new verification code has been sent to your email.'
        });
        this.startTimer();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to resend code.'
        });
      }
    });
  }
}

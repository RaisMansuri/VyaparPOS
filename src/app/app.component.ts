import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { LoaderService } from './core/loader.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProgressSpinnerModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'VyaparPOS';
  loader = inject(LoaderService);
  private authService = inject(AuthService);

  ngOnInit() {
    // Immediate check on load/refresh
    if (this.authService.isAuthenticated() && this.authService.isSessionExpired()) {
      this.authService.logout();
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { Notification } from '../../models/notification.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  public notificationService = inject(NotificationService);
  public translationService = inject(TranslationService);
  private router = inject(Router);

  notifications: Notification[] = [];

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.removeNotification(id);
  }

  getSeverity(type: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (type) {
      case 'success': return 'success';
      case 'warn': return 'warn';
      case 'error': return 'danger';
      default: return 'info';
    }
  }
}

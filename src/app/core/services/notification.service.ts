import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ProductService } from './product.service';
import { Notification, NotificationType } from '../../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);
  
  private readonly storageKey = 'vyaparpos_notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>(this.loadNotifications());
  
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.notifications$.pipe(
    map(perms => perms.filter(p => !p.isRead).length)
  );

  private loadNotifications(): Notification[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
    } catch {
      return [];
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    }
    this.notificationsSubject.next(notifications);
  }

  addNotification(title: string, message: string, type: NotificationType = 'info', link?: string): void {
    const notifications = this.notificationsSubject.value;
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date(),
      link
    };
    this.saveNotifications([newNotification, ...notifications].slice(0, 50)); // Keep last 50
  }

  markAsRead(id: string): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    this.saveNotifications(notifications);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
    this.saveNotifications(notifications);
  }

  removeNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.saveNotifications(notifications);
  }

  checkStockLevels(): void {
    this.productService.getLowStockProducts().subscribe((products) => {
      products.forEach(p => {
        const existing = this.notificationsSubject.value.find(n => 
          n.metadata?.productId === p.id && !n.isRead
        );
        if (!existing) {
          this.addNotification(
            'Low Stock Alert',
            `${p.name} is running low (${p.stock} left).`,
            'warn',
            `/products`
          );
          // Add metadata to avoid duplicates until read
          const current = this.notificationsSubject.value;
          current[0].metadata = { productId: p.id };
          this.saveNotifications(current);
        }
      });
    });
  }
}

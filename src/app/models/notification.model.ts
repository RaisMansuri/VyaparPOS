export type NotificationType = 'info' | 'success' | 'warn' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: Date;
  link?: string;
  metadata?: any;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SupportTicket, TicketComment } from '../../models/support.model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private ticketsSubject = new BehaviorSubject<SupportTicket[]>([
    {
      id: 'TKT-1001',
      subject: 'Order Delay - Fresh White Bread',
      description: 'The white bread order for this morning hasn\'t arrived yet.',
      status: 'Open',
      priority: 'High',
      customerName: 'Rahul Sharma',
      customerEmail: 'rahul.sharma@example.com',
      createdAt: new Date('2024-03-12T08:00:00'),
      comments: [
        {
          id: 'CMT-1',
          author: 'System',
          message: 'Ticket created automatically.',
          createdAt: new Date('2024-03-12T08:00:00')
        }
      ]
    },
    {
      id: 'TKT-1002',
      subject: 'Refund Request',
      description: 'Customer wants a refund for a stale croissant.',
      status: 'In Progress',
      priority: 'Medium',
      customerName: 'Anjali Gupta',
      customerEmail: 'anjali.gupta@example.com',
      createdAt: new Date('2024-03-11T14:30:00'),
      assignedTo: 'Store Manager',
      comments: [
        {
          id: 'CMT-2',
          author: 'Store Manager',
          message: 'Checking the batch number.',
          createdAt: new Date('2024-03-11T15:00:00')
        }
      ]
    }
  ]);

  get tickets$(): Observable<SupportTicket[]> {
    return this.ticketsSubject.asObservable();
  }

  createTicket(ticket: Partial<SupportTicket>): void {
    const current = this.ticketsSubject.getValue();
    const newTicket: SupportTicket = {
      id: `TKT-${(1001 + current.length).toString()}`,
      subject: ticket.subject || 'No Subject',
      description: ticket.description || 'No Description',
      status: 'Open',
      priority: ticket.priority || 'Medium',
      customerName: ticket.customerName || 'Guest',
      customerEmail: ticket.customerEmail || 'guest@example.com',
      createdAt: new Date(),
      comments: [
        {
          id: `CMT-${Date.now()}`,
          author: 'System',
          message: 'Ticket created.',
          createdAt: new Date()
        }
      ]
    };
    this.ticketsSubject.next([...current, newTicket]);
  }

  updateTicketStatus(id: string, status: SupportTicket['status']): void {
    const current = this.ticketsSubject.getValue();
    const index = current.findIndex(t => t.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], status, updatedAt: new Date() };
      this.ticketsSubject.next([...current]);
    }
  }

  addComment(id: string, author: string, message: string): void {
    const current = this.ticketsSubject.getValue();
    const index = current.findIndex(t => t.id === id);
    if (index !== -1) {
      const newComment: TicketComment = {
        id: `CMT-${Date.now()}`,
        author,
        message,
        createdAt: new Date()
      };
      const ticket = current[index];
      ticket.comments = [...(ticket.comments || []), newComment];
      ticket.updatedAt = new Date();
      current[index] = { ...ticket };
      this.ticketsSubject.next([...current]);
    }
  }

  deleteTicket(id: string): void {
    const current = this.ticketsSubject.getValue();
    this.ticketsSubject.next(current.filter(t => t.id !== id));
  }
}

import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { SupportTicket } from '../../models/support.model';
import { cloneSupportTickets } from '../mock-data';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tickets`;
  private mockTickets: SupportTicket[] = cloneSupportTickets();

  get tickets$(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(this.apiUrl).pipe(
      map(tickets => {
        const normalized = Array.isArray(tickets) ? tickets : ((tickets as any)?.data || (tickets as any)?.tickets || []);
        return Array.isArray(normalized) && normalized.length > 0 ? normalized : this.mockTickets;
      }),
      catchError(() => of(this.mockTickets))
    );
  }

  createTicket(ticket: Partial<SupportTicket>): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(this.apiUrl, ticket).pipe(
      catchError(() => {
        const localTicket: SupportTicket = {
          id: `TKT-${Date.now()}`,
          subject: ticket.subject || 'General Support',
          description: ticket.description || '',
          status: 'Open',
          priority: ticket.priority || 'Medium',
          customerName: ticket.customerName || 'Walk-in Customer',
          customerEmail: ticket.customerEmail || 'support.demo@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          comments: [],
        };
        this.mockTickets = [localTicket, ...this.mockTickets];
        return of(localTicket);
      })
    );
  }

  updateTicketStatus(id: string, status: SupportTicket['status']): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(() => {
        const current = this.mockTickets.find(ticket => ticket.id === id);
        const updated = {
          ...current!,
          status,
          updatedAt: new Date(),
        };
        this.mockTickets = this.mockTickets.map(ticket => ticket.id === id ? updated : ticket);
        return of(updated);
      })
    );
  }

  addComment(id: string, author: string, message: string): Observable<SupportTicket> {
      return this.http.post<SupportTicket>(`${this.apiUrl}/${id}/comments`, { author, message }).pipe(
        catchError(() => {
          const current = this.mockTickets.find(ticket => ticket.id === id);
          const updated = {
            ...current!,
            updatedAt: new Date(),
            comments: [
              ...(current?.comments || []),
              {
                id: `COM-${Date.now()}`,
                author,
                message,
                createdAt: new Date(),
              },
            ],
          };
          this.mockTickets = this.mockTickets.map(ticket => ticket.id === id ? updated : ticket);
          return of(updated);
        })
      );
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        this.mockTickets = this.mockTickets.filter(ticket => ticket.id !== id);
        return of(true);
      })
    );
  }
}

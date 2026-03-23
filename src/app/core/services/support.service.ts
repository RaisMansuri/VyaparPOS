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
  private tickets: SupportTicket[] = [];

  get tickets$(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(this.apiUrl).pipe(
      map(tickets => {
        const normalized = Array.isArray(tickets) ? tickets : ((tickets as any)?.data || (tickets as any)?.tickets || []);
        return Array.isArray(normalized) ? normalized : [];
      }),
      catchError(() => of([]))
    );
  }

  createTicket(ticket: Partial<SupportTicket>): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(this.apiUrl, ticket);
  }

  updateTicketStatus(id: string, status: SupportTicket['status']): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.apiUrl}/${id}/status`, { status });
  }

  addComment(id: string, author: string, message: string): Observable<SupportTicket> {
      return this.http.post<SupportTicket>(`${this.apiUrl}/${id}/comments`, { author, message });
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

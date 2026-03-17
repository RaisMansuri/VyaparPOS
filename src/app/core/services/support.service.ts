import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SupportTicket, TicketComment } from '../../models/support.model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tickets`;

  get tickets$(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(this.apiUrl);
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

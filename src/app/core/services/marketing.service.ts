import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/marketing`;

  sendBulkMessage(data: { message: string, type: 'SMS' | 'WhatsApp', customerIds?: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-bulk`, data);
  }

  getMarketingStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProfitLossData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  tax: number;
  discount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getProfitLoss(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/profit-loss`, { params: filters });
  }
}

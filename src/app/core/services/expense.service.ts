import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  paidBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  getExpenses(filters?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params: filters });
  }

  getExpenseStats(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { params: filters });
  }

  createExpense(expense: Expense): Observable<any> {
    return this.http.post(this.apiUrl, expense);
  }

  updateExpense(id: string, expense: Partial<Expense>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

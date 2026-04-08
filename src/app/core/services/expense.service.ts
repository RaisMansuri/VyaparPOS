import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
  providedIn: 'root',
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses`;

  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  public expenses$ = this.expensesSubject.asObservable();

  constructor() {
    this.loadExpenses();
  }

  loadExpenses(filters?: any): void {
    this.http.get<any>(this.apiUrl, { params: filters }).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res.data || [];
        this.expensesSubject.next(data);
      },
      error: (err) => {
        console.error('Failed to load expenses', err);
        this.expensesSubject.next([]);
      },
    });
  }

  getExpenses(filters?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params: filters });
  }

  getExpenseStats(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { params: filters });
  }

  createExpense(expense: Expense): Observable<any> {
    return this.http.post<any>(this.apiUrl, expense).pipe(tap(() => this.loadExpenses()));
  }

  updateExpense(id: string, expense: Partial<Expense>): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, expense)
      .pipe(tap(() => this.loadExpenses()));
  }

  deleteExpense(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadExpenses()));
  }
}

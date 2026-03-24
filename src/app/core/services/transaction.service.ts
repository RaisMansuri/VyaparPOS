import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction } from '../../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transactions`;

  /**
   * Fetch all transactions with optional filtering.
   */
  getTransactions(filters?: any): Observable<Transaction[]> {
    return this.http.get<any>(this.apiUrl, { params: filters }).pipe(      
      map(res => {
        const data = Array.isArray(res) ? res : (res?.data || res?.transactions || []);
        
        return data.map((t: any) => ({
          ...t,
          date: new Date(t.date || t.timestamp || t.createdAt)
        }));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get summary stats for payments.
   */
  getTransactionStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(res => res.data || {
        totalVolume: 0,
        upiVolume: 0,
        cashVolume: 0,
        cardVolume: 0,
        refundVolume: 0,
        settledRate: 0
      }),
      catchError(() => of({
        totalVolume: 0,
        upiVolume: 0,
        cashVolume: 0,
        cardVolume: 0,
        refundVolume: 0,
        settledRate: 0
      }))
    );
  }

  private getMockTransactions(): Transaction[] {
    const now = new Date();
    return [
      {
        id: 'TXN-1001',
        type: 'Sale',
        amount: 1250,
        method: 'UPI',
        upiId: 'pay@axl',
        status: 'Completed',
        date: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
        referenceId: 'REF-882190',
        customerName: 'Rahul Sharma'
      },
      {
        id: 'TXN-1002',
        type: 'Expense',
        amount: 500,
        method: 'Cash',
        status: 'Completed',
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
        referenceId: 'VCHR-001',
        description: 'Office Supplies'
      },
      {
        id: 'TXN-1003',
        type: 'Sale',
        amount: 2100,
        method: 'UPI',
        upiId: '9876543210@ybl',
        status: 'Completed',
        date: new Date(now.getTime() - 1000 * 60 * 60 * 25),
        referenceId: 'REF-882201',
        customerName: 'Priya Singh'
      },
      {
        id: 'TXN-1004',
        type: 'Refund',
        amount: 150,
        method: 'Card',
        status: 'Completed',
        date: new Date(now.getTime() - 1000 * 60 * 60 * 48),
        referenceId: 'REF-882150',
        customerName: 'Amit Patel'
      }
    ];
  }
}

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
        return data.map((t: any) => this.mapToTransaction(t));
      }),
      catchError(() => {
        // Fallback: Fetch from /sales and map orders to transactions
        return this.http.get<any>(`${environment.apiUrl}/sales`).pipe(
          map(res => {
            const orders = Array.isArray(res) ? res : (res?.data || res?.orders || []);
            return orders.map((o: any) => this.mapOrderToTransaction(o));
          }),
          catchError(() => of([]))
        );
      })
    );
  }

  /**
   * Get summary stats for payments.
   */
  getTransactionStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(res => res.data || res),
      catchError(() => {
        // Fallback: Aggregate from /sales
        return this.http.get<any>(`${environment.apiUrl}/sales`).pipe(
          map(res => {
            const orders = Array.isArray(res) ? res : (res?.data || res?.orders || []);
            const stats = {
              totalVolume: 0,
              upiVolume: 0,
              cashVolume: 0,
              cardVolume: 0,
              refundVolume: 0,
              settledRate: 100
            };

            orders.forEach((o: any) => {
              const amount = o.totalAmount || 0;
              stats.totalVolume += amount;
              const method = (o.paymentMethod || '').toLowerCase();
              if (method.includes('upi')) stats.upiVolume += amount;
              else if (method.includes('cash')) stats.cashVolume += amount;
              else if (method.includes('card')) stats.cardVolume += amount;
            });

            return stats;
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
      })
    );
  }

  private mapOrderToTransaction(o: any): Transaction {
    return {
      id: o.id || `TXN-${Date.now()}`,
      type: 'Sale',
      amount: o.totalAmount || 0,
      method: this.normalizePaymentMethod(o.paymentMethod),
      status: this.normalizeStatus(o.status || o.paymentStatus),
      date: new Date(o.orderDate || o.createdAt || o.date || Date.now()),
      referenceId: o.id?.split('-').pop() || 'REF-000',
      customerName: o.address?.fullName || 'Walk-in Customer',
      description: `Order with ${o.items?.length || 0} items`
    };
  }

  private mapToTransaction(t: any): Transaction {
    return {
      ...t,
      date: new Date(t.date || t.timestamp || t.createdAt || Date.now()),
      method: this.normalizePaymentMethod(t.method || t.paymentMethod),
      status: this.normalizeStatus(t.status || t.paymentStatus)
    };
  }

  private normalizePaymentMethod(method: string = ''): any {
    const m = method.toLowerCase();
    if (m.includes('upi')) return 'UPI';
    if (m.includes('card')) return 'Card';
    if (m.includes('cash')) return 'Cash';
    if (m.includes('bank')) return 'Bank Transfer';
    return 'Cash';
  }

  private normalizeStatus(status: string = ''): any {
    const s = status.toLowerCase();
    if (s.includes('comp') || s.includes('paid') || s.includes('conf')) return 'Completed';
    if (s.includes('fail')) return 'Failed';
    if (s.includes('pend')) return 'Pending';
    if (s.includes('refu')) return 'Refunded';
    return 'Completed';
  }
}

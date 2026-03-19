import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject, switchMap, shareReplay, tap, catchError, of } from 'rxjs';
import { Customer } from '../../models/customer.model';
import { cloneCustomers } from '../mock-data';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;
  private mockCustomersSubject = new BehaviorSubject<Customer[]>(cloneCustomers());

  private refreshSubject = new BehaviorSubject<void>(undefined);

  public customers$: Observable<Customer[]> = this.refreshSubject.pipe(
    switchMap(() => this.http.get<any>(this.apiUrl).pipe(
      map(res => this.normalizeCustomers(res)),
      catchError(() => of(this.mockCustomersSubject.value))
    )),
    shareReplay(1)
  );

  refreshCustomers(): void {
    this.refreshSubject.next();
  }

  getCustomersObservable(): Observable<Customer[]> {
    return this.customers$;
  }

  addCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer).pipe(
      tap(saved => {
        this.mockCustomersSubject.next([saved, ...this.mockCustomersSubject.value]);
        this.refreshCustomers();
      }),
      catchError(() => {
        const mockCustomer: Customer = {
          id: `CUS-${Date.now()}`,
          name: customer.name || 'Walk-in Customer',
          email: customer.email || 'demo.customer@example.com',
          phone: customer.phone || '9999999999',
          address: customer.address || '',
          totalOrders: 0,
          totalSpent: 0,
          notes: customer.notes,
          preferences: [],
          createdAt: new Date(),
        };
        this.mockCustomersSubject.next([mockCustomer, ...this.mockCustomersSubject.value]);
        this.refreshCustomers();
        return of(mockCustomer);
      })
    );
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updated => {
        this.mockCustomersSubject.next(
          this.mockCustomersSubject.value.map(customer => customer.id === id ? { ...customer, ...updated } : customer)
        );
        this.refreshCustomers();
      }),
      catchError(() => {
        const fallback = this.mockCustomersSubject.value.find(customer => customer.id === id);
        const updated = { ...fallback, ...updates } as Customer;
        this.mockCustomersSubject.next(
          this.mockCustomersSubject.value.map(customer => customer.id === id ? updated : customer)
        );
        this.refreshCustomers();
        return of(updated);
      })
    );
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.mockCustomersSubject.next(this.mockCustomersSubject.value.filter(customer => customer.id !== id));
        this.refreshCustomers();
      }),
      catchError(() => {
        this.mockCustomersSubject.next(this.mockCustomersSubject.value.filter(customer => customer.id !== id));
        this.refreshCustomers();
        return of(true);
      })
    );
  }

  private normalizeCustomers(res: any): Customer[] {
    const customers = Array.isArray(res) ? res : (res?.data || res?.customers || []);
    if (!Array.isArray(customers) || customers.length === 0) {
      return this.mockCustomersSubject.value;
    }

    this.mockCustomersSubject.next(customers);
    return customers;
  }
}

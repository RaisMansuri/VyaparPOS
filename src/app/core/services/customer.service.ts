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
      catchError(err => {
        console.error('Customer fetch error:', err);
        return of(this.mockCustomersSubject.value);
      })
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
      tap(() => this.refreshCustomers()),
      catchError(err => {
        console.warn('Customer add failed, using mock fallback', err);
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
      tap(() => this.refreshCustomers()),
      catchError(err => {
        console.warn('Customer update failed, using mock fallback', err);
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
      tap(() => this.refreshCustomers()),
      catchError(err => {
        console.warn('Customer delete failed, using mock fallback', err);
        this.mockCustomersSubject.next(this.mockCustomersSubject.value.filter(customer => customer.id !== id));
        this.refreshCustomers();
        return of(true);
      })
    );
  }

  private normalizeCustomers(res: any): Customer[] {
    // If backend explicitly returns an empty array, believe it.
    // If it's undefined or null, it's an error/loading state where we might use mocks.
    const customers = Array.isArray(res) ? res : (res?.data || res?.customers);
    
    if (customers === undefined || customers === null) {
      return this.mockCustomersSubject.value;
    }

    if (Array.isArray(customers)) {
       // Update mocks local storage to stay in sync if needed
       this.mockCustomersSubject.next(customers);
       return customers;
    }

    return this.mockCustomersSubject.value;
  }
}

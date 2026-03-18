import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject, switchMap, shareReplay, tap } from 'rxjs';
import { Customer } from '../../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  private refreshSubject = new BehaviorSubject<void>(undefined);

  public customers$: Observable<Customer[]> = this.refreshSubject.pipe(
    switchMap(() => this.http.get<any>(this.apiUrl)),
    map(res => Array.isArray(res) ? res : (res.data || res.customers || [])),
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
      tap(() => this.refreshCustomers())
    );
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(() => this.refreshCustomers())
    );
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshCustomers())
    );
  }
}

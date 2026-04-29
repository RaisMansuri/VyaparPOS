import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject, switchMap, shareReplay, tap, catchError, of } from 'rxjs';
import { Supplier } from '../../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/suppliers`;
  
  private mockSuppliersSubject = new BehaviorSubject<Supplier[]>([
    {
      id: 'SUP-001',
      name: 'Global Tech Wholesalers',
      contactPerson: 'John Doe',
      email: 'john@globaltech.com',
      phone: '9876543210',
      address: '123 Supply Lane, Tech City',
      gstNumber: '24AAAAA0000A1Z5',
      categories: ['Electronics', 'Accessories'],
      lastSupplyDate: new Date(),
      outstandingPayment: 5000,
      createdAt: new Date()
    }
  ]);

  private refreshSubject = new BehaviorSubject<void>(undefined);

  public suppliers$: Observable<Supplier[]> = this.refreshSubject.pipe(
    switchMap(() => this.http.get<any>(this.apiUrl).pipe(
      map(res => this.normalizeSuppliers(res)),
      catchError(err => {
        console.error('Supplier fetch error:', err);
        return of(this.mockSuppliersSubject.value);
      })
    )),
    shareReplay(1)
  );

  refreshSuppliers(): void {
    this.refreshSubject.next();
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.suppliers$;
  }

  addSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier).pipe(
      tap(() => this.refreshSuppliers()),
      catchError(err => {
        console.warn('Supplier add failed, using mock fallback', err);
        const mockSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          name: supplier.name || 'New Supplier',
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          gstNumber: supplier.gstNumber || '',
          categories: supplier.categories || [],
          lastSupplyDate: undefined,
          outstandingPayment: 0,
          createdAt: new Date(),
        };
        this.mockSuppliersSubject.next([mockSupplier, ...this.mockSuppliersSubject.value]);
        this.refreshSuppliers();
        return of(mockSupplier);
      })
    );
  }

  private normalizeSuppliers(res: any): Supplier[] {
    const suppliers = Array.isArray(res) ? res : (res?.data || res?.suppliers);
    if (!suppliers) {
      return this.mockSuppliersSubject.value;
    }
    return suppliers;
  }
}

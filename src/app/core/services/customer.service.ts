import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Customer } from '../../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>([
    {
      id: 'CUST-001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      address: 'Sector 4, Rohini, Delhi',
      totalOrders: 5,
      totalSpent: 12500,
      lastOrderDate: new Date('2024-03-01'),
      createdAt: new Date('2023-12-15'),
      notes: 'Prefers early morning delivery'
    },
    {
      id: 'CUST-002',
      name: 'Anjali Gupta',
      email: 'anjali.gupta@example.com',
      phone: '9823456789',
      address: 'HSR Layout, Bangalore',
      totalOrders: 3,
      totalSpent: 4500,
      lastOrderDate: new Date('2024-02-25'),
      createdAt: new Date('2024-01-10')
    }
  ]);

  get customers$(): Observable<Customer[]> {
    return this.customersSubject.asObservable();
  }

  getCustomers(): Customer[] {
    return this.customersSubject.getValue();
  }

  addCustomer(customer: Partial<Customer>): void {
    const current = this.customersSubject.getValue();
    const newCustomer: Customer = {
      ...customer as Customer,
      id: `CUST-${(current.length + 1).toString().padStart(3, '0')}`,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date()
    };
    this.customersSubject.next([...current, newCustomer]);
  }

  updateCustomer(id: string, updates: Partial<Customer>): void {
    const current = this.customersSubject.getValue();
    const index = current.findIndex(c => c.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      this.customersSubject.next([...current]);
    }
  }

  deleteCustomer(id: string): void {
    const current = this.customersSubject.getValue();
    this.customersSubject.next(current.filter(c => c.id !== id));
  }
}

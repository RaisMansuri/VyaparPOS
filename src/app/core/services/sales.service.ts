import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales`;

  getSalesByDay(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(res => {
        const source = Array.isArray(res?.data?.byDay) ? res.data.byDay : [];
        return {
          labels: source.map((d: any) => d._id || d.date),
          datasets: [
            {
              label: 'Revenue',
              data: source.map((d: any) => d.revenue),
              fill: false,
              borderColor: '#4bc0c0'
            },
            {
              label: 'Orders',
              data: source.map((d: any) => d.count || d.orders),
              fill: false,
              borderColor: '#565656'
            }
          ]
        };
      }),
      catchError(() => of({
        labels: [],
        datasets: [
          { label: 'Revenue', data: [], fill: false, borderColor: '#4bc0c0' },
          { label: 'Orders', data: [], fill: false, borderColor: '#565656' }
        ]
      }))
    );
  }

  getSalesByCategory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(res => {
        const source = Array.isArray(res?.data?.byCategory) && res.data.byCategory.length > 0 ? res.data.byCategory : [];
        return {
          labels: source.map((c: any) => c._id || 'Unknown'),
          datasets: [
            {
              data: source.map((c: any) => c.value),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
              ]
            }
          ]
        };
      }),

    );
  }

  getDailySalesReport(category?: any, productId?: any): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/daily-report`).pipe(
      map(res => this.filterReports(Array.isArray(res?.data) ? res.data : [], category, productId)),
      catchError(() => of([]))
    );
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
      map(products => {
        const normalized = Array.isArray(products) ? products : (products?.data || products?.products || []);
        return Array.isArray(normalized) ? normalized : [];
      }),
      catchError(() => of([]))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/products/categories`).pipe(
      map(categories => {
        const normalized = Array.isArray(categories) ? categories : ((categories as any)?.data || (categories as any)?.categories || []);
        return Array.isArray(normalized) ? normalized : [];
      }),
      catchError(() => of([]))
    );
  }

  private filterReports(reports: any[], category?: any, productId?: any): any[] {
    return reports.filter(report => {
      const categoryMatch = category ? report.category === category : true;
      const productMatch = productId ? report.productId === productId : true;
      return categoryMatch && productMatch;
    });
  }
}

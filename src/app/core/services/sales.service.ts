import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import {
  MOCK_DAILY_REPORTS,
  MOCK_PRODUCTS,
  MOCK_SALES_BY_CATEGORY,
  MOCK_SALES_BY_DAY,
} from '../mock-data';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales`;

  getSalesByDay(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
        map(res => {
            const source = Array.isArray(res?.byDay) && res.byDay.length > 0 ? res.byDay : MOCK_SALES_BY_DAY;
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
          labels: MOCK_SALES_BY_DAY.map(day => day.date),
          datasets: [
            { label: 'Revenue', data: MOCK_SALES_BY_DAY.map(day => day.revenue), fill: false, borderColor: '#4bc0c0' },
            { label: 'Orders', data: MOCK_SALES_BY_DAY.map(day => day.orders), fill: false, borderColor: '#565656' }
          ]
        }))
    );
  }

  getSalesByCategory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
        map(res => {
            const source = Array.isArray(res?.byCategory) && res.byCategory.length > 0 ? res.byCategory : MOCK_SALES_BY_CATEGORY;
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
        catchError(() => of({
          labels: MOCK_SALES_BY_CATEGORY.map(category => category._id),
          datasets: [
            {
              data: MOCK_SALES_BY_CATEGORY.map(category => category.value),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
          ]
        }))
    );
  }

  getDailySalesReport(category?: any, productId?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/daily-report`).pipe(
      map(reports => this.filterReports(Array.isArray(reports) && reports.length > 0 ? reports : MOCK_DAILY_REPORTS, category, productId)),
      catchError(() => of(this.filterReports(MOCK_DAILY_REPORTS, category, productId)))
    );
  }

  getProducts(): Observable<any[]> {
      return this.http.get<any>(`${environment.apiUrl}/products`).pipe(
        map(products => {
          const normalized = Array.isArray(products) ? products : (products?.data || products?.products || []);
          return Array.isArray(normalized) && normalized.length > 0 ? normalized : MOCK_PRODUCTS;
        }),
        catchError(() => of(MOCK_PRODUCTS))
      );
  }

  getCategories(): Observable<string[]> {
      return this.http.get<string[]>(`${environment.apiUrl}/products/categories`).pipe(
        map(categories => {
          const normalized = Array.isArray(categories) ? categories : ((categories as any)?.data || (categories as any)?.categories || []);
          return Array.isArray(normalized) && normalized.length > 0 ? normalized : [...new Set(MOCK_PRODUCTS.map(product => product.category))];
        }),
        catchError(() => of([...new Set(MOCK_PRODUCTS.map(product => product.category))]))
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

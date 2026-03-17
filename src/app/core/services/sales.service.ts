import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales`;

  getSalesByDay(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
        map(res => {
            return {
                labels: res.byDay.map((d: any) => d._id),
                datasets: [
                    {
                        label: 'Revenue',
                        data: res.byDay.map((d: any) => d.revenue),
                        fill: false,
                        borderColor: '#4bc0c0'
                    },
                    {
                        label: 'Orders',
                        data: res.byDay.map((d: any) => d.count),
                        fill: false,
                        borderColor: '#565656'
                    }
                ]
            };
        })
    );
  }

  getSalesByCategory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
        map(res => {
            return {
                labels: res.byCategory.map((c: any) => c._id || 'Unknown'),
                datasets: [
                    {
                        data: res.byCategory.map((c: any) => c.value),
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
        })
    );
  }

  getDailySalesReport(category?: any, productId?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/daily-report`);
  }

  getProducts(): Observable<any[]> {
      return this.http.get<any[]>(`${environment.apiUrl}/products`);
  }

  getCategories(): Observable<string[]> {
      return this.http.get<string[]>(`${environment.apiUrl}/products/categories`);
  }
}

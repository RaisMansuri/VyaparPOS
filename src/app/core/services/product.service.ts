import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { Transaction, DashboardStats } from '../../models/transaction.model';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    if (category === 'all') {
      return this.http.get<Product[]>(this.apiUrl);
    }
    return this.http.get<Product[]>(this.apiUrl).pipe(
      map(products => products.filter(p => p.category.toLowerCase() === category.toLowerCase()))
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<any>(`${environment.apiUrl}/sales/stats`).pipe(
        map(res => {
            // Note: DashboardStats defined in frontend might need adaptation 
            // but we'll return what we have for now and adjust as we see UI
            return {
                grossTotal: 0, // Placeholder
                netProfit: 0,
                totalStockValue: 0,
                totalItemsInStock: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                ...res.overall // Assuming we might add overall stats to stats endpoint
            };
        })
    );
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${(product as any)._id || product.id}`, product);
  }

  deleteProduct(id: any): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
        map(() => true)
    );
  }
}

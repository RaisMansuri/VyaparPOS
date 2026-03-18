import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { Transaction, DashboardStats } from '../../models/transaction.model';
import { Observable, map, shareReplay, BehaviorSubject, switchMap, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  private productsSubject = new BehaviorSubject<void>(undefined);
  
  public products$: Observable<Product[]> = this.productsSubject.pipe(
    switchMap(() => this.http.get<any>(this.apiUrl)),
    map(res => Array.isArray(res) ? res : (res.data || res.products || [])),
    shareReplay(1)
  );

  private lowStockSubject = new BehaviorSubject<void>(undefined);
  public lowStockProducts$: Observable<Product[]> = this.lowStockSubject.pipe(
    switchMap(() => this.http.get<any>(`${this.apiUrl}/low-stock`)),
    map(res => Array.isArray(res) ? res : (res.data || res.products || [])),
    shareReplay(1)
  );

  private categoriesSubject = new BehaviorSubject<void>(undefined);
  public categories$: Observable<string[]> = this.categoriesSubject.pipe(
    switchMap(() => this.http.get<any>(`${this.apiUrl}/categories`)),
    map(res => Array.isArray(res) ? res : (res.data || res.categories || [])),
    shareReplay(1)
  );

  refreshProducts(): void {
    this.productsSubject.next();
    this.lowStockSubject.next();
    this.categoriesSubject.next();
  }

  refreshCategories(): void {
    this.categoriesSubject.next();
  }

  getCategories(): Observable<string[]> {
    return this.categories$;
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    if (category === 'all') {
      return this.products$;
    }
    return this.products$.pipe(
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
    return this.lowStockProducts$;
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.refreshProducts())
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${(product as any)._id || product.id}`, product).pipe(
      tap(() => this.refreshProducts())
    );
  }

  deleteProduct(id: any): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshProducts()),
      map(() => true)
    );
  }
}

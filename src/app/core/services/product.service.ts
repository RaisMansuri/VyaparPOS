import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { DashboardStats } from '../../models/transaction.model';
import { Observable, map, shareReplay, BehaviorSubject, switchMap, of, tap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { cloneProducts, MOCK_DASHBOARD_STATS } from '../mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;
  private mockProductsSubject = new BehaviorSubject<Product[]>(cloneProducts());

  private productsSubject = new BehaviorSubject<void>(undefined);
  
  public products$: Observable<Product[]> = this.productsSubject.pipe(
    switchMap(() => this.http.get<any>(this.apiUrl).pipe(
      map(res => this.normalizeProducts(res)),
      catchError(() => of(this.mockProductsSubject.value))
    )),
    shareReplay(1)
  );

  private lowStockSubject = new BehaviorSubject<void>(undefined);
  public lowStockProducts$: Observable<Product[]> = this.lowStockSubject.pipe(
    switchMap(() => this.http.get<any>(`${this.apiUrl}/low-stock`).pipe(
      map(res => this.normalizeLowStockProducts(res)),
      catchError(() => of(this.mockProductsSubject.value.filter(product => product.stock <= product.minStockLevel)))
    )),
    shareReplay(1)
  );

  private categoriesSubject = new BehaviorSubject<void>(undefined);
  public categories$: Observable<string[]> = this.categoriesSubject.pipe(
    switchMap(() => this.http.get<any>(`${this.apiUrl}/categories`).pipe(
      map(res => this.normalizeCategories(res)),
      catchError(() => of(this.extractCategories(this.mockProductsSubject.value)))
    )),
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
            if (!res?.overall) {
              return this.buildMockDashboardStats();
            }
            return {
                grossTotal: 0,
                netProfit: 0,
                totalStockValue: 0,
                totalItemsInStock: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                ...res.overall // Assuming we might add overall stats to stats endpoint
            };
        }),
        catchError(() => of(this.buildMockDashboardStats()))
    );
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.lowStockProducts$;
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(saved => {
        this.mockProductsSubject.next([saved, ...this.mockProductsSubject.value]);
        this.refreshProducts();
      }),
      catchError(() => {
        const localProduct = { ...product, id: Date.now() };
        this.mockProductsSubject.next([localProduct, ...this.mockProductsSubject.value]);
        this.refreshProducts();
        return of(localProduct);
      })
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${(product as any)._id || product.id}`, product).pipe(
      tap(updated => {
        this.mockProductsSubject.next(
          this.mockProductsSubject.value.map(item => item.id === updated.id ? updated : item)
        );
        this.refreshProducts();
      }),
      catchError(() => {
        this.mockProductsSubject.next(
          this.mockProductsSubject.value.map(item => item.id === product.id ? product : item)
        );
        this.refreshProducts();
        return of(product);
      })
    );
  }

  deleteProduct(id: any): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.mockProductsSubject.next(this.mockProductsSubject.value.filter(item => item.id !== id));
        this.refreshProducts();
      }),
      map(() => true),
      catchError(() => {
        this.mockProductsSubject.next(this.mockProductsSubject.value.filter(item => item.id !== id));
        this.refreshProducts();
        return of(true);
      })
    );
  }

  private normalizeProducts(res: any): Product[] {
    let products = this.extractProducts(res);
    
    // Map _id to id for all products
    products = products.map(p => ({
      ...p,
      id: p.id || (p as any)._id
    }));

    if (!Array.isArray(products) || products.length === 0) {
      return this.mockProductsSubject.value;
    }

    this.mockProductsSubject.next(products);
    return products;
  }

  private normalizeLowStockProducts(res: any): Product[] {
    let products = this.extractProducts(res);

    // Map _id to id for all products
    products = products.map(p => ({
      ...p,
      id: p.id || (p as any)._id
    }));

    if (!Array.isArray(products) || products.length === 0) {
      return this.mockProductsSubject.value.filter(product => product.stock <= product.minStockLevel);
    }

    return products;
  }

  private normalizeCategories(res: any): string[] {
    const categories = Array.isArray(res) ? res : (res?.data || res?.categories || []);
    if (!Array.isArray(categories) || categories.length === 0) {
      return this.extractCategories(this.mockProductsSubject.value);
    }
    return categories;
  }

  private extractProducts(res: any): Product[] {
    return Array.isArray(res) ? res : (res?.data || res?.products || []);
  }

  private extractCategories(products: Product[]): string[] {
    return [...new Set(products.map(product => product.category))];
  }

  private buildMockDashboardStats(): DashboardStats {
    const products = this.mockProductsSubject.value;
    return {
      ...MOCK_DASHBOARD_STATS,
      totalStockValue: products.reduce((sum, product) => sum + (product.costPrice * product.stock), 0),
      totalItemsInStock: products.reduce((sum, product) => sum + product.stock, 0),
      lowStockCount: products.filter(product => product.stock > 0 && product.stock <= product.minStockLevel).length,
      outOfStockCount: products.filter(product => product.stock === 0).length,
    };
  }
}

import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../../models/product.model';
import { DashboardStats } from '../../models/transaction.model';
import { Observable, map, of, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();
  
  /**
   * Returns a snapshot of the current products in the subject.
   */
  getProductsSnapshot(): Product[] {
    return this.productsSubject.value;
  }

  private categoriesSubject = new BehaviorSubject<string[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private lowStockSubject = new BehaviorSubject<Product[]>([]);
  public lowStockProducts$ = this.lowStockSubject.asObservable();

  constructor() {}

  refreshAll(): void {
    this.getProducts().subscribe();
    this.getCategories().subscribe();
    this.getLowStockProducts().subscribe();
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.normalizeProducts(res)),
      tap(products => this.productsSubject.next(products)),
      catchError(() => {
        this.productsSubject.next([]);
        return of([]);
      })
    );
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/low-stock`).pipe(
      map(res => this.normalizeLowStockProducts(res)),
      tap(products => this.lowStockSubject.next(products)),
      catchError(() => {
        this.lowStockSubject.next([]);
        return of([]);
      })
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    if (category === 'all') {
      return this.products$;
    }
    return this.products$.pipe(
      map((products: Product[]) => products.filter((p: Product) => p.category.toLowerCase() === category.toLowerCase()))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/categories`).pipe(
      map(res => this.normalizeCategories(res)),
      tap(categories => this.categoriesSubject.next(categories)),
      catchError(() => {
        this.categoriesSubject.next([]);
        return of([]);
      })
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<any>(`${environment.apiUrl}/sales/stats`).pipe(
        map(res => {
            return {
                grossTotal: 0,
                netProfit: 0,
                totalStockValue: 0,
                totalItemsInStock: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                ...res.overall
            };
        }),
        catchError(() => of({
            grossTotal: 0,
            netProfit: 0,
            totalStockValue: 0,
            totalItemsInStock: 0,
            lowStockCount: 0,
            outOfStockCount: 0
        }))
    );
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.getProducts().subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${(product as any)._id || product.id}`, product).pipe(
      tap(() => this.getProducts().subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  deleteProduct(id: any): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => this.getProducts().subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  private normalizeProducts(res: any): Product[] {
    let products = this.extractProducts(res);
    
    // Map _id to id for all products
    products = products.map(p => ({
      ...p,
      id: p.id || (p as any)._id
    }));

    return products;
  }

  private normalizeLowStockProducts(res: any): Product[] {
    let products = this.extractProducts(res);

    // Map _id to id for all products
    products = products.map(p => ({
      ...p,
      id: p.id || (p as any)._id
    }));

    return products;
  }

  private normalizeCategories(res: any): string[] {
    return Array.isArray(res) ? res : (res?.data || res?.categories || []);
  }

  private extractProducts(res: any): Product[] {
    return Array.isArray(res) ? res : (res?.data || res?.products || []);
  }

  refreshProducts(): void {
    this.getProducts().subscribe();
  }

  uploadProductImage(file: File): Observable<{ data: { url: string } }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');
    return this.http.post<{ data: { url: string } }>(`${environment.apiUrl}/upload`, formData);
  }
}

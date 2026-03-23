import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.http.get<any>(this.apiUrl).subscribe(res => {
      const cats = Array.isArray(res) ? res : (res.data || []);
      this.categoriesSubject.next(cats);
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<any>(this.apiUrl);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<any>(this.apiUrl, category).pipe(
      tap(() => this.loadCategories())
    );
  }

  updateCategory(id: string, category: Category): Observable<Category> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, category).pipe(
      tap(() => this.loadCategories())
    );
  }

  deleteCategory(id: string): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadCategories()),
      catchError(() => of(false))
    );
  }
}

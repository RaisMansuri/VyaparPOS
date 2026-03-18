import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private productService = inject(ProductService);
  private lowStockAlertsSubject = new BehaviorSubject<Product[]>([]);

  get lowStockAlerts$(): Observable<Product[]> {
    return this.lowStockAlertsSubject.asObservable();
  }

  checkStockLevels(): void {
    this.productService.getLowStockProducts().subscribe((products) => {
      this.lowStockAlertsSubject.next(products);
    });
  }
}

import { Injectable } from '@angular/core';
import { Product } from '../../models/product.model';
import { Transaction, DashboardStats } from '../../models/transaction.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    { id: 1, barcode: '8901234567890', name: 'Fresh White Bread', price: 40, costPrice: 25, stock: 50, minStockLevel: 10, description: 'Soft and fluffy white bread.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Breads', quantity: 0 },
    { id: 2, barcode: '8901234567891', name: 'Whole Wheat Bread', price: 50, costPrice: 30, stock: 5, minStockLevel: 10, description: 'Healthy and nutritious.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', category: 'Breads', discount: { type: 'daily', value: 10 }, quantity: 0 },
    { id: 3, barcode: '8901234567892', name: 'French Baguette', price: 60, costPrice: 35, stock: 15, minStockLevel: 5, description: 'Classic crusty French baguette.', imageUrl: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?w=400', category: 'Breads', quantity: 0 },
    { id: 6, barcode: '8901234567893', name: 'Chocolate Cake', price: 500, costPrice: 300, stock: 0, minStockLevel: 5, description: 'Rich chocolate ganache cake.', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'Cakes', quantity: 0 },
    { id: 7, barcode: '8901234567894', name: 'Vanilla Sponge Cake', price: 400, costPrice: 200, stock: 12, minStockLevel: 5, description: 'Light and airy vanilla cake.', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400', category: 'Cakes', quantity: 0 },
    { id: 11, barcode: '8901234567895', name: 'Butter Croissant', price: 45, costPrice: 20, stock: 30, minStockLevel: 15, description: 'Flaky and buttery.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', category: 'Pastries', quantity: 0 },
  ];

  private transactions: Transaction[] = [
    { id: 1, productId: 1, productName: 'Fresh White Bread', category: 'Breads', quantity: 10, sellingPrice: 40, costPrice: 25, totalPrice: 400, profit: 150, timestamp: new Date() },
    { id: 2, productId: 7, productName: 'Vanilla Sponge Cake', category: 'Cakes', quantity: 2, sellingPrice: 400, costPrice: 200, totalPrice: 800, profit: 400, timestamp: new Date() },
    { id: 3, productId: 11, productName: 'Butter Croissant', category: 'Pastries', quantity: 20, sellingPrice: 45, costPrice: 20, totalPrice: 900, profit: 500, timestamp: new Date() },
  ];

  getCategories(): Observable<string[]> {
    const categories = Array.from(new Set(this.products.map(p => p.category)));
    return of(categories);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    if (category === 'all') {
      return of(this.products);
    }
    const filtered = this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return of(filtered);
  }

  getDashboardStats(): Observable<DashboardStats> {
    const grossTotal = this.transactions.reduce((sum, t) => sum + t.totalPrice, 0);
    const netProfit = this.transactions.reduce((sum, t) => sum + t.profit, 0);
    const totalItemsInStock = this.products.reduce((sum, p) => sum + p.stock, 0);
    const totalStockValue = this.products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
    const lowStockCount = this.products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel).length;
    const outOfStockCount = this.products.filter(p => p.stock === 0).length;

    return of({
      grossTotal,
      netProfit,
      totalStockValue,
      totalItemsInStock,
      lowStockCount,
      outOfStockCount
    });
  }

  getLowStockProducts(): Observable<Product[]> {
    return of(this.products.filter(p => p.stock <= p.minStockLevel));
  }
}

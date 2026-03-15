import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductService } from '../core/services/product.service';
import { DashboardStats } from '../models/transaction.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);

  stats: DashboardStats | null = null;
  lowStockProducts: Product[] = [];

  ngOnInit() {
    this.productService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });

    this.productService.getLowStockProducts().subscribe(products => {
      this.lowStockProducts = products;
    });
  }

  getStockSeverity(product: Product): "danger" | "warn" | "success" | "secondary" | "info" | "contrast" | undefined {
    if (product.stock === 0) return 'danger';
    if (product.stock <= product.minStockLevel) return 'warn';
    return 'success';
  }
}


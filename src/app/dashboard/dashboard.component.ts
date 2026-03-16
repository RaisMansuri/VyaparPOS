import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '../core/services/product.service';
import { DashboardStats } from '../models/transaction.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, CurrencyPipe, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

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

  navigate(path: string) {
    this.router.navigate([path]);
  }

  getStockSeverity(product: Product): "danger" | "warn" | "success" | "secondary" | "info" | "contrast" | undefined {
    if (product.stock === 0) return 'danger';
    if (product.stock <= product.minStockLevel) return 'warn';
    return 'success';
  }
}


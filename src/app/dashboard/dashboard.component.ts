import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';
import { ProductService } from '../core/services/product.service';
import { SalesService } from '../core/services/sales.service';
import { AuthService } from '../auth/auth.service';
import { DashboardStats } from '../models/transaction.model';
import { Product } from '../models/product.model';

type DurationFilter = '7d' | '30d' | '90d' | 'custom';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    TableModule,
    TagModule,
    CurrencyPipe,
    ButtonModule,
    SidebarModule,
    DropdownModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private salesService = inject(SalesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = 'User';

  stats: DashboardStats | null = null;
  lowStockProducts: Product[] = [];
  allProducts: Product[] = [];
  allReports: any[] = [];

  lineData: any;
  categoryChartData: any;
  productChartData: any;
  lineOptions: any;
  doughnutOptions: any;
  barOptions: any;

  filterDrawerVisible = false;
  selectedDuration: DurationFilter = '30d';
  selectedCategory: string | null = null;
  selectedProduct: string | number | null = null;
  customStartDate = '';
  customEndDate = '';

  categoryOptions: Array<{ label: string; value: string | null }> = [
    { label: 'All Categories', value: null },
  ];
  productOptions: Array<{ label: string; value: string | number | null; category?: string }> = [
    { label: 'All Products', value: null },
  ];
  filteredProductOptions: Array<{ label: string; value: string | number | null; category?: string }> = [
    { label: 'All Products', value: null },
  ];
  durationOptions: Array<{ label: string; value: DurationFilter }> = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Custom Range', value: 'custom' },
  ];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'User';

    this.initChartOptions();

    this.productService.getProductsByCategory('all').subscribe((products) => {
      this.allProducts = products;
      this.setupProductFilters();
      this.applyFilters();
    });

    this.salesService.getDailySalesReport().subscribe((reports) => {
      this.allReports = reports;
      this.applyFilters();
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  getStockSeverity(
    product: Product
  ): 'danger' | 'warn' | 'success' | 'secondary' | 'info' | 'contrast' | undefined {
    if (product.stock === 0) return 'danger';
    if (product.stock <= product.minStockLevel) return 'warn';
    return 'success';
  }

  get activeFilterLabels(): string[] {
    const labels: string[] = [];

    if (this.selectedDuration !== '30d') {
      labels.push(this.durationOptions.find((option) => option.value === this.selectedDuration)?.label || 'Custom');
    }

    if (this.selectedCategory) {
      labels.push(this.selectedCategory);
    }

    if (this.selectedProduct) {
      const product = this.allProducts.find((item) => item.id == this.selectedProduct);
      if (product) {
        labels.push(product.name);
      }
    }

    if (this.selectedDuration === 'custom' && (this.customStartDate || this.customEndDate)) {
      labels.push(
        `${this.customStartDate || 'Start'} to ${this.customEndDate || 'End'}`
      );
    }

    return labels;
  }

  onCategoryChange(): void {
    this.filteredProductOptions = this.selectedCategory
      ? this.productOptions.filter(
          (option) => option.value === null || option.category === this.selectedCategory
        )
      : [...this.productOptions];

    const selectedExists = this.filteredProductOptions.some(
      (option) => option.value === this.selectedProduct
    );

    if (!selectedExists) {
      this.selectedProduct = null;
    }
  }

  applyFilters(): void {
    this.onCategoryChange();

    const filteredInventoryProducts = this.allProducts.filter((product) => {
      const categoryMatch = this.selectedCategory ? product.category === this.selectedCategory : true;
      const productMatch = this.selectedProduct ? product.id == this.selectedProduct : true;
      return categoryMatch && productMatch;
    });

    const filteredReports = this.allReports.filter((report) => {
      const reportDate = this.toDate(report.date || report._id);
      const categoryMatch = this.selectedCategory ? report.category === this.selectedCategory : true;
      const productMatch = this.selectedProduct ? report.productId == this.selectedProduct : true;
      const dateMatch = this.matchesDateFilter(reportDate);
      return categoryMatch && productMatch && dateMatch;
    });

    this.lowStockProducts = filteredInventoryProducts.filter(
      (product) => product.stock <= product.minStockLevel
    );

    this.stats = {
      grossTotal: filteredReports.reduce((sum, report) => sum + (report.revenue || 0), 0),
      netProfit: filteredReports.reduce((sum, report) => sum + (report.profit || 0), 0),
      totalStockValue: filteredInventoryProducts.reduce(
        (sum, product) => sum + product.costPrice * product.stock,
        0
      ),
      totalItemsInStock: filteredInventoryProducts.reduce((sum, product) => sum + product.stock, 0),
      lowStockCount: filteredInventoryProducts.filter(
        (product) => product.stock > 0 && product.stock <= product.minStockLevel
      ).length,
      outOfStockCount: filteredInventoryProducts.filter((product) => product.stock === 0).length,
    };

    this.lineData = this.buildLineChart(filteredReports);
    this.categoryChartData = this.buildCategoryChart(filteredReports);
    this.productChartData = this.buildProductChart(filteredReports);
  }

  resetFilters(): void {
    this.selectedDuration = '30d';
    this.selectedCategory = null;
    this.selectedProduct = null;
    this.customStartDate = '';
    this.customEndDate = '';
    this.filteredProductOptions = [...this.productOptions];
    this.applyFilters();
  }

  private setupProductFilters(): void {
    this.categoryOptions = [
      { label: 'All Categories', value: null },
      ...[...new Set(this.allProducts.map((product) => product.category))].map((category) => ({
        label: category,
        value: category,
      })),
    ];

    this.productOptions = [
      { label: 'All Products', value: null },
      ...this.allProducts.map((product) => ({
        label: product.name,
        value: product.id,
        category: product.category,
      })),
    ];

    this.filteredProductOptions = [...this.productOptions];
  }

  private initChartOptions(): void {
    this.lineOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#475569',
            usePointStyle: true,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#e2e8f0' },
        },
      },
    };

    this.doughnutOptions = {
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#475569',
            padding: 18,
            usePointStyle: true,
          },
        },
      },
    };

    this.barOptions = {
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: { color: '#64748b' },
          grid: { color: '#e2e8f0' },
        },
        y: {
          ticks: { color: '#64748b' },
          grid: { display: false },
        },
      },
    };
  }

  private buildLineChart(reports: any[]): any {
    const sortedReports = [...reports].sort(
      (a, b) => this.toDate(a.date || a._id).getTime() - this.toDate(b.date || b._id).getTime()
    );

    const labels =
      sortedReports.length > 0
        ? sortedReports.map((report) =>
            this.toDate(report.date || report._id).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })
          )
        : ['No data'];

    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: sortedReports.length > 0 ? sortedReports.map((report) => report.revenue || 0) : [0],
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.12)',
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Profit',
          data: sortedReports.length > 0 ? sortedReports.map((report) => report.profit || 0) : [0],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: false,
          tension: 0.35,
        },
      ],
    };
  }

  private buildCategoryChart(reports: any[]): any {
    const totals = reports.reduce((acc, report) => {
      const key = report.category || 'Unknown';
      acc[key] = (acc[key] || 0) + (report.revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    return {
      labels: labels.length > 0 ? labels : ['No data'],
      datasets: [
        {
          data: data.length > 0 ? data : [1],
          backgroundColor: ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'],
        },
      ],
    };
  }

  private buildProductChart(reports: any[]): any {
    const totals = reports.reduce((acc, report) => {
      const productId = report.productId;
      const productName =
        this.allProducts.find((product) => product.id == productId)?.name || `Product ${productId}`;

      acc[productName] = (acc[productName] || 0) + (report.revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    const topProducts = (Object.entries(totals) as Array<[string, number]>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: topProducts.length > 0 ? topProducts.map(([name]) => name) : ['No data'],
      datasets: [
        {
          data: topProducts.length > 0 ? topProducts.map(([, value]) => value) : [0],
          backgroundColor: ['#1d4ed8', '#0f766e', '#d97706', '#dc2626', '#7c3aed'],
          borderRadius: 10,
          maxBarThickness: 42,
        },
      ],
    };
  }

  private matchesDateFilter(reportDate: Date): boolean {
    if (this.selectedDuration === 'custom') {
      const start = this.customStartDate ? new Date(this.customStartDate) : null;
      const end = this.customEndDate ? new Date(this.customEndDate) : null;

      if (start && reportDate < this.startOfDay(start)) {
        return false;
      }

      if (end && reportDate > this.endOfDay(end)) {
        return false;
      }

      return true;
    }

    const days = this.selectedDuration === '7d' ? 7 : this.selectedDuration === '90d' ? 90 : 30;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - days);

    return reportDate >= this.startOfDay(minDate);
  }

  private toDate(value: string | Date): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private endOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }
}

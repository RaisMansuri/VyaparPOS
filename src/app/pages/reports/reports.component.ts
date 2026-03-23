import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { SalesService } from '../../core/services/sales.service';
import { ReportService, ProfitLossData } from '../../core/services/report.service';
import { AuthService } from '../../auth/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ChartModule, 
    CardModule, 
    TableModule, 
    DropdownModule, 
    ButtonModule,
    TooltipModule,
    SelectButtonModule,
    RippleModule,
    SidebarModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private salesService = inject(SalesService);
  private reportService = inject(ReportService);
  private auth = inject(AuthService);

  isManager = this.auth.isManager();
  isConsumer = this.auth.isConsumer();

  lineData: any;
  pieData: any;
  profitLossData: any;
  chartOptions: any;
  doughnutOptions: any;
  dailyReports: any[] = [];
  
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  
  selectedCategory: any = null;
  selectedProduct: any = null;
  currentPeriod: string = 'week';
  filterDrawerVisible: boolean = false;

  summaryStats = {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topCategory: 'N/A',
    revenueTrend: '+12.4%',
    ordersTrend: '+8.1%',
    avgTrend: '-2.3%'
  };

  ngOnInit(): void {
    this.loadFilters();
    this.loadData();
    this.loadFinancials();
    this.initChartOptions();
  }

  loadFinancials() {
    this.reportService.getProfitLoss().subscribe((res: any) => {
      this.profitLossData = res.data;
    });
  }

  initChartOptions() {
    this.chartOptions = {
      plugins: {
        legend: { display: false }
      },
      maintainAspectRatio: false,
      aspectRatio: 2,
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: '#f1f5f9' }
        }
      },
      elements: {
          line: {
              tension: 0.4,
              borderWidth: 3,
              fill: true,
              backgroundColor: 'rgba(16, 185, 129, 0.1)'
          },
          point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 6,
              backgroundColor: '#10b981'
          }
      }
    };

    this.doughnutOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        maintainAspectRatio: false
    };
  }

  loadFilters() {
    this.salesService.getCategories().subscribe(cats => {
        this.categories = [{ label: 'All Categories', value: null }, ...cats.map(c => ({ label: c, value: c }))];
    });
    this.salesService.getProducts().subscribe(prods => {
        this.products = prods;
        this.filteredProducts = [{ label: 'All Products', value: null }, ...prods.map(p => ({ label: p.name, value: p.id, category: p.category }))];
    });
  }

  loadData() {
    this.salesService.getSalesByDay().subscribe(data => {
      // Map labels to dd/MM/yyyy format
      const formattedLabels = (data.labels || []).map((l: any) => {
        const date = new Date(l);
        if (isNaN(date.getTime())) return l;
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      });

      this.lineData = {
          ...data,
          labels: formattedLabels,
          datasets: data.datasets.map((ds: any) => ({
              ...ds,
              fill: true,
              backgroundColor: ds.label === 'Revenue' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              borderColor: ds.label === 'Revenue' ? '#10b981' : '#3b82f6',
              tension: 0.4
          }))
      };
    });

    this.salesService.getSalesByCategory().subscribe(data => {
      this.pieData = data;
    });

    this.salesService.getDailySalesReport(this.selectedCategory, this.selectedProduct).subscribe(data => {
      this.dailyReports = data;
      this.calculateSummary();
    });
  }

  onCategoryChange() {
      if (this.selectedCategory) {
          const catProds = this.products.filter(p => p.category === this.selectedCategory);
          this.filteredProducts = [{ label: 'All Products', value: null }, ...catProds.map(p => ({ label: p.name, value: p.id }))];
      } else {
          this.filteredProducts = [{ label: 'All Products', value: null }, ...this.products.map(p => ({ label: p.name, value: p.id }))];
      }
      this.selectedProduct = null;
      this.loadData();
  }

  onProductChange() {
      this.loadData();
  }

  calculateSummary() {
      this.summaryStats.totalRevenue = this.dailyReports.reduce((sum, r) => sum + r.revenue, 0);
      this.summaryStats.totalOrders = this.dailyReports.reduce((sum, r) => sum + r.orders, 0);
      this.summaryStats.avgOrderValue = this.summaryStats.totalOrders ? Math.round(this.summaryStats.totalRevenue / this.summaryStats.totalOrders) : 0;
      this.summaryStats.topCategory = this.selectedCategory || 'Breads';
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.text('Sales Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    if (this.selectedCategory) doc.text(`Category: ${this.selectedCategory}`, 14, 28);
    
    const tableData = this.dailyReports.map(r => {
        const date = new Date(r._id || r.date);
        const formattedDate = isNaN(date.getTime()) ? (r._id || r.date) : 
            `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        return [
            formattedDate,
            r.orders,
            `Rs. ${r.taxable}`,
            `Rs. ${r.gst}`,
            `Rs. ${r.revenue}`,
            ...(this.isConsumer ? [] : [`Rs. ${r.profit}`])
        ];
    });

    const headers = this.isConsumer ? 
        [['Date', 'Orders', 'Taxable', 'GST', 'Total Spent']] : 
        [['Date', 'Orders', 'Taxable', 'GST', 'Revenue', 'Profit']];

    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 35
    });

    doc.save('sales-report.pdf');
  }

  exportToExcel() {
    const data = this.dailyReports.map(r => {
        const date = new Date(r._id || r.date);
        const formattedDate = isNaN(date.getTime()) ? (r._id || r.date) : 
            `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        return {
            Date: formattedDate,
            Orders: r.orders,
            'Taxable Value': r.taxable,
            'GST Paid': r.gst,
            [this.isConsumer ? 'Total Spent' : 'Revenue']: r.revenue,
            ...(this.isConsumer ? {} : { Profit: r.profit })
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
    XLSX.writeFile(workbook, 'sales-report.xlsx');
  }
}

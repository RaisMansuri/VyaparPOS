import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SalesService } from '../../core/services/sales.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule, TableModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private salesService = inject(SalesService);

  lineData: any;
  pieData: any;
  chartOptions: any;
  dailyReports: any[] = [];

  ngOnInit(): void {
    this.salesService.getSalesByDay().subscribe(data => {
      this.lineData = data;
    });

    this.salesService.getSalesByCategory().subscribe(data => {
      this.pieData = data;
    });

    this.salesService.getDailySalesReport().subscribe(data => {
      this.dailyReports = data;
    });

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }
}

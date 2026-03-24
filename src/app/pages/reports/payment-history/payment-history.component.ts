import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction, TransactionStatus, TransactionType } from '../../../models/transaction.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    SelectModule,
    CalendarModule,
    CardModule,
    TooltipModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css'
})
export class PaymentHistoryComponent implements OnInit {
  private transactionService = inject(TransactionService);

  transactions: Transaction[] = [];
  loading: boolean = true;
  stats: any = {};

  typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Sale', value: 'Sale' },
    { label: 'Expense', value: 'Expense' },
    { label: 'Refund', value: 'Refund' }
  ];

  methodOptions = [
    { label: 'All Methods', value: null },
    { label: 'UPI', value: 'UPI' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Card', value: 'Card' },
    { label: 'Bank', value: 'Bank Transfer' }
  ];

  selectedType: string | null = null;
  selectedMethod: string | null = null;
  dateRange: Date[] | null = null;

  ngOnInit(): void {
    this.loadTransactions();
    this.loadStats();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  loadStats(): void {
    this.transactionService.getTransactionStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  getStatusSeverity(status: TransactionStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warn';
      case 'Failed': return 'danger';
      case 'Refunded': return 'info';
      default: return 'secondary';
    }
  }

  getTypeIcon(type: TransactionType): string {
    switch (type) {
      case 'Sale': return 'pi pi-arrow-down-left text-green-500';
      case 'Expense': return 'pi pi-arrow-up-right text-red-500';
      case 'Refund': return 'pi pi-refresh text-blue-500';
      case 'Wallet': return 'pi pi-wallet text-purple-500';
      default: return 'pi pi-question';
    }
  }

  getMethodIcon(method: string): string {
    switch (method) {
      case 'UPI': return 'pi pi-mobile';
      case 'Cash': return 'pi pi-money-bill';
      case 'Card': return 'pi pi-credit-card';
      case 'Bank Transfer': return 'pi pi-building';
      default: return 'pi pi-wallet';
    }
  }
}

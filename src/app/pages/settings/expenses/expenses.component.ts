import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService, Expense } from '../../../core/services/expense.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    CardModule,
    TagModule
  ],
  providers: [],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  expenses: Expense[] = [];
  expenseForm: FormGroup;
  displayDialog: boolean = false;
  editingExpense: Expense | null = null;
  loading: boolean = false;

  categories = [
    { label: 'Rent', value: 'Rent' },
    { label: 'Salaries', value: 'Salaries' },
    { label: 'Electricity', value: 'Electricity' },
    { label: 'Inventory', value: 'Inventory' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'Other', value: 'Other' }
  ];

  stats = {
    totalAmount: 0,
    count: 0
  };

  constructor() {
    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['Other', Validators.required],
      date: [new Date(), Validators.required],
      description: [''],
      paidBy: ['Admin']
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadStats();
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getExpenses().subscribe({
      next: (res) => {
        this.expenses = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  loadStats(): void {
    this.expenseService.getExpenseStats().subscribe({
      next: (res) => {
        this.stats.totalAmount = res.data.total;
        this.stats.count = this.expenses.length; // Approximate or from aggregate
      }
    });
  }

  showDialog(expense?: Expense): void {
    this.editingExpense = expense || null;
    if (expense) {
      this.expenseForm.patchValue({
        ...expense,
        date: new Date(expense.date)
      });
    } else {
      this.expenseForm.reset({
        title: '',
        amount: 0,
        category: 'Other',
        date: new Date(),
        description: '',
        paidBy: 'Admin'
      });
    }
    this.displayDialog = true;
  }

  saveExpense(): void {
    if (this.expenseForm.invalid) return;

    const expenseData = this.expenseForm.value;

    if (this.editingExpense?._id) {
      this.expenseService.updateExpense(this.editingExpense._id, expenseData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense updated' });
          this.loadExpenses();
          this.loadStats();
          this.displayDialog = false;
        }
      });
    } else {
      this.expenseService.createExpense(expenseData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense recorded' });
          this.loadExpenses();
          this.loadStats();
          this.displayDialog = false;
        }
      });
    }
  }

  deleteExpense(id: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this expense?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.expenseService.deleteExpense(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense deleted' });
            this.loadExpenses();
            this.loadStats();
          }
        });
      }
    });
  }

  getSeverity(category: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (category) {
      case 'Rent': return 'danger';
      case 'Salaries': return 'warn';
      case 'Inventory': return 'info';
      case 'Electricity': return 'contrast';
      default: return 'secondary';
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../models/customer.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  customers: Customer[] = [];
  customerForm: FormGroup;
  showDialog = false;
  editingCustomerId: string | null = null;

  constructor() {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.customerService.customers$.subscribe(data => {
      this.customers = data;
    });
  }

  openNew(): void {
    this.editingCustomerId = null;
    this.customerForm.reset();
    this.showDialog = true;
  }

  editCustomer(customer: Customer): void {
    this.editingCustomerId = customer.id;
    this.customerForm.patchValue(customer);
    this.showDialog = true;
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      this.customerService.deleteCustomer(customer.id);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Customer removed' });
    }
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;

    const val = this.customerForm.value;
    if (this.editingCustomerId) {
      this.customerService.updateCustomer(this.editingCustomerId, val);
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Customer info saved' });
    } else {
      this.customerService.addCustomer(val);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New customer added' });
    }
    this.showDialog = false;
  }
}

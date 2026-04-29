import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ToolbarModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    TagModule
  ],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private messageService = inject(MessageService);

  suppliers: Supplier[] = [];
  supplierDialog = false;
  supplier: Partial<Supplier> = {};
  submitted = false;

  ngOnInit(): void {
    this.supplierService.getSuppliers().subscribe(data => {
      this.suppliers = data;
    });
  }

  openNew(): void {
    this.supplier = {
      categories: []
    };
    this.submitted = false;
    this.supplierDialog = true;
  }

  editSupplier(supplier: Supplier): void {
    this.supplier = { ...supplier };
    this.supplierDialog = true;
  }

  hideDialog(): void {
    this.supplierDialog = false;
    this.submitted = false;
  }

  saveSupplier(): void {
    this.submitted = true;

    if (this.supplier.name?.trim()) {
      if (this.supplier.id) {
        // Update logic (mocked for now in service)
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Supplier Updated', life: 3000 });
      } else {
        this.supplierService.addSupplier(this.supplier).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Supplier Created', life: 3000 });
        });
      }

      this.supplierDialog = false;
      this.supplier = {};
    }
  }
}

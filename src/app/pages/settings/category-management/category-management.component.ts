import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../models/category.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-category-management',
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
    TagModule,
    RippleModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  categories: Category[] = [];
  categoryDialog = false;
  category: Category = { name: '' };
  submitted = false;

  ngOnInit(): void {
    this.categoryService.categories$.subscribe(data => {
      this.categories = data;
    });
  }

  openNew(): void {
    this.category = { name: '' };
    this.submitted = false;
    this.categoryDialog = true;
  }

  editCategory(category: Category): void {
    this.category = { ...category };
    this.categoryDialog = true;
  }

  deleteCategory(category: Category): void {
    this.confirmationService.confirm({
      message: `<b>${category.name}</b> will be permanently removed?`,
      header: 'Delete category?',
      icon: 'pi pi-trash',
      acceptLabel: 'Delete',
      rejectLabel: 'Keep it',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        if (category.id || category._id) {
          this.categoryService.deleteCategory((category.id || category._id) as string).subscribe(success => {
            if (success) {
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete category. Check if products are still assigned.', life: 4000 });
            }
          });
        }
      }
    });
  }

  hideDialog(): void {
    this.categoryDialog = false;
    this.submitted = false;
  }

  saveCategory(): void {
    this.submitted = true;

    if (this.category.name?.trim()) {
      if (this.category.id || this.category._id) {
        this.categoryService.updateCategory((this.category.id || this.category._id) as string, this.category).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
            this.categoryDialog = false;
            this.category = { name: '' };
          },
          error: (err) => {
             this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Update failed', life: 4000 });
          }
        });
      } else {
        this.categoryService.createCategory(this.category).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
            this.categoryDialog = false;
            this.category = { name: '' };
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Creation failed', life: 4000 });
          }
        });
      }
    }
  }
}

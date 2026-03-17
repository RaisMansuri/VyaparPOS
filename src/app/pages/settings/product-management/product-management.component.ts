import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../models/product.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    ToolbarModule,
    InputNumberModule,
    FloatLabelModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    InputTextarea
  ],
  providers: [MessageService],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  products: Product[] = [];
  productDialog: boolean = false;
  productForm: FormGroup;
  submitted: boolean = false;
  isEditMode: boolean = false;
  categories: any[] = [];
  constructor() {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStockLevel: [5, [Validators.required, Validators.min(0)]],
      barcode: [''],
      gstRate: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl: ['https://via.placeholder.com/150']
    });
  }

  ngOnInit() {
    this.categories = [
      { name: 'Electronics', code: 'ELE' },
      { name: 'Groceries', code: 'GRO' },
      { name: 'Clothing', code: 'CLO' },
      { name: 'Home Appliances', code: 'HAPP' },
      { name: 'Beverages', code: 'BEV' }
    ];
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProductsByCategory('all').subscribe(data => {
      this.products = data;
    });
  }

  openNew() {
    this.productForm.reset({
      price: 0,
      costPrice: 0,
      stock: 0,
      minStockLevel: 5,
      gstRate: 0,
      imageUrl: 'https://via.placeholder.com/150'
    });
    this.submitted = false;
    this.productDialog = true;
    this.isEditMode = false;
  }

  editProduct(product: Product) {
    this.productForm.patchValue(product);
    this.productDialog = true;
    this.isEditMode = true;
  }

  deleteProduct(product: Product) {
    if (confirm('Are you sure you want to delete ' + product.name + '?')) {
      this.productService.deleteProduct(product.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
        this.loadProducts();
      });
    }
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.productForm.invalid) {
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode) {
      this.productService.updateProduct(productData).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        this.loadProducts();
        this.productDialog = false;
      });
    } else {
      this.productService.addProduct(productData).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        this.loadProducts();
        this.productDialog = false;
      });
    }
  }
}

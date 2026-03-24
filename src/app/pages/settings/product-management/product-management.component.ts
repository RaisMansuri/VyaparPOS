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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
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
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit {
  public readonly defaultImageUrl = 'https://placehold.co/150/e2e8f0/64748b?text=Product';
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  products: Product[] = [];
  productDialog: boolean = false;
  productForm: FormGroup;
  submitted: boolean = false;
  isEditMode: boolean = false;
  categories: any[] = [];
  imagePreviewUrl = this.defaultImageUrl;
  selectedImageName = '';
  readonly acceptedImageExtensions = '.jpg,.jpeg,.png,.webp';

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
      imageUrl: [this.defaultImageUrl]
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
      imageUrl: this.defaultImageUrl
    });
    this.imagePreviewUrl = this.defaultImageUrl;
    this.selectedImageName = '';
    this.submitted = false;
    this.productDialog = true;
    this.isEditMode = false;
  }

  editProduct(product: Product) {
    this.productForm.patchValue(product);
    this.imagePreviewUrl = product.imageUrl || this.defaultImageUrl;
    this.selectedImageName = this.getFileNameFromUrl(product.imageUrl);
    this.productDialog = true;
    this.isEditMode = true;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `<b>${product.name}</b> will be permanently removed from inventory?`,
      header: 'Delete product?',
      icon: 'pi pi-trash',
      acceptLabel: 'Delete',
      rejectLabel: 'Keep it',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
          this.loadProducts();
        });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.stock <= (p.minStockLevel || 0)).length;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!this.isSupportedImage(file)) {
      input.value = '';
      this.messageService.add({
        severity: 'warn',
        summary: 'Unsupported Image',
        detail: 'Please upload a JPG, JPEG, PNG, or WEBP image.'
      });
      return;
    }

    // Show temporary preview while uploading
    const reader = new FileReader();
    reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.selectedImageName = 'Uploading...';
    this.productService.uploadProductImage(file).subscribe({
      next: (res: any) => {
        const url = res.data.url;
        this.imagePreviewUrl = url;
        this.selectedImageName = file.name;
        this.productForm.patchValue({ imageUrl: url });
        this.productForm.get('imageUrl')?.markAsDirty();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Image uploaded to cloud' });
      },
      error: (err) => {
        this.imagePreviewUrl = this.defaultImageUrl;
        this.selectedImageName = '';
        this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: err.error?.message || 'Failed to upload photo' });
      }
    });
  }

  removeSelectedImage(fileInput?: HTMLInputElement): void {
    this.imagePreviewUrl = this.defaultImageUrl;
    this.selectedImageName = '';
    this.productForm.patchValue({
      imageUrl: this.defaultImageUrl
    });

    if (fileInput) {
      fileInput.value = '';
    }
  }

  saveProduct() {
    this.submitted = true;

    if (this.productForm.invalid) {
      return;
    }

    const rawData = this.productForm.value;
    const productData = {
      ...rawData,
      category: typeof rawData.category === 'object' ? rawData.category.name : rawData.category,
      imageUrl: rawData.imageUrl || this.defaultImageUrl
    };

    if (this.isEditMode) {
      this.productService.updateProduct(productData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
          this.loadProducts();
          this.productDialog = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Update failed' });
        }
      });
    } else {
      this.productService.addProduct(productData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
          this.loadProducts();
          this.productDialog = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Creation failed' });
        }
      });
    }
  }

  private isSupportedImage(file: File): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  }

  private getFileNameFromUrl(url?: string): string {
    if (!url || url.startsWith('data:') || url === this.defaultImageUrl) {
      return '';
    }

    const segments = url.split('/');
    return segments[segments.length - 1];
  }
}

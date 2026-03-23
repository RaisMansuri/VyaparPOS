import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule, FileUploadEvent } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface Product {
    id: number;
    name: string;
    imageUrl: string;
    category: string;
    price: number;
    stock: number;
    barcode: string;
}

@Component({
    selector: 'app-products',
    standalone: true,
    providers: [ConfirmationService],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        DialogModule,
        DropdownModule,
        ConfirmDialogModule,
        FileUploadModule,
        InputNumberModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

    products: Product[] = [];
    categories: any[] = [];
    loading: boolean = true;
    globalFilterFields: string[] = ['name', 'category', 'barcode'];

    productDialog: boolean = false;
    product!: Product;
    submitted: boolean = false;
    uploadedImage: any = null;

    constructor(private toastService: ToastService, private confirmationService: ConfirmationService) { }

    ngOnInit() {
        this.categories = [
            { label: 'Beverages', value: 'Beverages' },
            { label: 'Snacks', value: 'Snacks' },
            { label: 'Dairy', value: 'Dairy' },
            { label: 'Produce', value: 'Produce' }
        ];

        // Dummy data
        this.products = [
            { id: 101, name: 'Coca Cola 2L', imageUrl: '', category: 'Beverages', price: 2.50, stock: 45, barcode: '890103001234' },
            { id: 102, name: 'Lays Chips', imageUrl: '', category: 'Snacks', price: 1.20, stock: 12, barcode: '890103005678' },
            { id: 103, name: 'Fresh Milk 1L', imageUrl: '', category: 'Dairy', price: 1.80, stock: 8, barcode: '890103009012' }
        ];

        this.loading = false;
    }

    getStockSeverity(stock: number) {
        if (stock > 20) return 'success';
        if (stock > 5) return 'warn';
        return 'danger';
    }

    openNew() {
        this.product = { id: 0, name: '', imageUrl: '', category: '', price: 0, stock: 0, barcode: this.generateBarcode() };
        this.submitted = false;
        this.productDialog = true;
        this.uploadedImage = null;
    }

    editProduct(prod: Product) {
        this.product = { ...prod };
        this.productDialog = true;
        this.uploadedImage = null;
    }

    deleteProduct(prod: Product) {
        this.confirmationService.confirm({
            message: `<b>${prod.name}</b> will be permanently removed from the catalog?`,
            header: 'Delete product?',
            icon: 'pi pi-trash',
            acceptLabel: 'Delete',
            rejectLabel: 'Keep it',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.products = this.products.filter((val) => val.id !== prod.id);
                this.product = { id: 0, name: '', imageUrl: '', category: '', price: 0, stock: 0, barcode: '' };
                this.toastService.success('Successful', 'Product Deleted');
            }
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;

        if (this.product.name?.trim() && this.product.category && this.product.price > 0 && this.product.stock >= 0) {

            if (this.uploadedImage) {
                this.product.imageUrl = this.uploadedImage.objectURL;
            }

            if (this.product.id) {
                this.products[this.findIndexById(this.product.id)] = this.product;
                this.toastService.success('Successful', 'Product Updated');
            } else {
                this.product.id = this.createId();
                if (!this.product.barcode) this.product.barcode = this.generateBarcode();
                this.products.push(this.product);
                this.toastService.success('Successful', 'Product Created');
            }

            this.products = [...this.products];
            this.productDialog = false;
            this.product = { id: 0, name: '', imageUrl: '', category: '', price: 0, stock: 0, barcode: '' };
        }
    }

    onImageSelect(event: any) {
        if (event.files && event.files.length > 0) {
            this.uploadedImage = event.files[0];
            this.toastService.info('Success', 'Image ready for upload.');
        }
    }

    onBulkUpload(event: any) {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = reader.result as string;
                this.processCSVData(text);
            };
            reader.readAsText(file);
        }
    }

    processCSVData(csvText: string) {
        const lines = csvText.split('\n');
        let addedCount = 0;

        for (let i = 1; i < lines.length; i++) { // Skip header row
            if (!lines[i].trim()) continue;
            const data = lines[i].split(',');
            if (data.length >= 4) {
                const newProd: Product = {
                    id: this.createId(),
                    name: data[0].trim(),
                    category: data[1].trim(),
                    price: parseFloat(data[2].trim()) || 0,
                    stock: parseInt(data[3].trim()) || 0,
                    barcode: data[4] ? data[4].trim() : this.generateBarcode(),
                    imageUrl: ''
                };
                this.products.push(newProd);
                addedCount++;
            }
        }

        this.products = [...this.products];
        this.toastService.success('Bulk Upload Complete', `${addedCount} products added.`);
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): number {
        return Math.floor(Math.random() * 10000);
    }

    generateBarcode(): string {
        // Generates a mock 12 digit EAN-like barcode
        return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    }
}

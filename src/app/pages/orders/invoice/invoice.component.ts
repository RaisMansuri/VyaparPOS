import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../models/order.model';

@Component({
    selector: 'app-invoice',
    standalone: true,
    imports: [
        CommonModule, CurrencyPipe, DatePipe, FormsModule,
        ButtonModule, DialogModule, InputTextModule, ToastModule
    ],
    providers: [MessageService],
    templateUrl: './invoice.component.html',
    styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit {
    @ViewChild('invoiceArea') invoiceArea!: ElementRef;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private orderService = inject(OrderService);
    private messageService = inject(MessageService);

    order: Order | null = null;
    invoiceNumber = '';

    // Send dialog
    showSendDialog = false;
    sendEmail = '';
    sendPhone = '';
    isSending = false;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.order = this.orderService.getOrderById(id);
            }
            if (!this.order) {
                this.router.navigate(['/orders']);
                return;
            }
            // Generate invoice number from order ID
            this.invoiceNumber = 'INV-' + this.order.id.replace('ORD-', '');
        });
    }

    printInvoice(): void {
        window.print();
    }

    isDownloading = false;

    async downloadInvoice(): Promise<void> {
        const invoiceEl = this.invoiceArea?.nativeElement;
        if (!invoiceEl || this.isDownloading) return;

        this.isDownloading = true;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(invoiceEl, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${this.invoiceNumber}.pdf`);

            this.messageService.add({
                severity: 'success',
                summary: 'Downloaded',
                detail: `Invoice ${this.invoiceNumber}.pdf downloaded!`
            });
        } catch (err) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to generate PDF. Please try printing instead.'
            });
        } finally {
            this.isDownloading = false;
        }
    }

    openSendDialog(): void {
        this.showSendDialog = true;
    }

    sendInvoice(): void {
        if (!this.sendEmail && !this.sendPhone) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Required',
                detail: 'Please enter an email or phone number'
            });
            return;
        }

        this.isSending = true;

        // Simulate sending
        setTimeout(() => {
            this.isSending = false;
            this.showSendDialog = false;

            const destination = this.sendEmail || this.sendPhone;
            this.messageService.add({
                severity: 'success',
                summary: 'Invoice Sent!',
                detail: `Invoice sent to ${destination}`,
                life: 4000
            });

            this.sendEmail = '';
            this.sendPhone = '';
        }, 1500);
    }

    getPaymentLabel(method: string): string {
        switch (method) {
            case 'credit_card': return 'Credit Card';
            case 'debit_card': return 'Debit Card';
            case 'upi': return 'UPI';
            default: return method;
        }
    }

    goBack(): void {
        if (this.order) {
            this.router.navigate(['/orders', this.order.id]);
        } else {
            this.router.navigate(['/orders']);
        }
    }
}

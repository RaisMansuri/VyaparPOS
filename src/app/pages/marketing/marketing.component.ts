import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketingService } from '../../core/services/marketing.service';
import { CustomerService } from '../../core/services/customer.service';
import { ToastService } from '../../core/services/toast.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ButtonModule, 
    InputTextarea, MultiSelectModule, SelectButtonModule
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css']
})
export class MarketingComponent implements OnInit {
  private marketingService = inject(MarketingService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  customers: any[] = [];
  selectedCustomers: string[] = [];
  message = '';
  typeOptions = [
    { label: 'WhatsApp', value: 'WhatsApp', icon: 'pi pi-whatsapp' },
    { label: 'SMS', value: 'SMS', icon: 'pi pi-comment' }
  ];
  selectedType = 'WhatsApp';
  isSending = false;
  stats: any = null;

  ngOnInit(): void {
    this.customerService.customers$.subscribe(data => {
      this.customers = data.map(c => ({ label: c.name, value: c.id }));
    });
    this.loadStats();
  }

  loadStats(): void {
    this.marketingService.getMarketingStats().subscribe(res => {
      this.stats = res.data;
    });
  }

  sendMessage(): void {
    if (!this.message.trim()) {
      this.toastService.error('Required', 'Please enter a message content.');
      return;
    }

    this.isSending = true;
    this.marketingService.sendBulkMessage({
      message: this.message,
      type: this.selectedType as 'SMS' | 'WhatsApp',
      customerIds: this.selectedCustomers.length > 0 ? this.selectedCustomers : undefined
    }).subscribe({
      next: (res) => {
        this.toastService.success('Success', res.message);
        this.message = '';
        this.selectedCustomers = [];
        this.isSending = false;
        this.loadStats();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to send messages.');
        this.isSending = false;
      }
    });
  }
}

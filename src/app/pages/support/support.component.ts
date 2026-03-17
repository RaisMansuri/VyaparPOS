import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService } from '../../core/services/support.service';
import { SupportTicket, TicketStatus, TicketPriority } from '../../models/support.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    TagModule,
    FloatLabelModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit {
  private supportService = inject(SupportService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  tickets: SupportTicket[] = [];
  ticketForm: FormGroup;
  showDialog = false;
  viewTicketDialog = false;
  selectedTicket: SupportTicket | null = null;
  newComment = '';

  statusOptions: { label: string; value: TicketStatus }[] = [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' }
  ];

  priorityOptions: { label: string; value: TicketPriority }[] = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Urgent', value: 'Urgent' }
  ];

  constructor() {
    this.ticketForm = this.fb.group({
      subject: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['Medium', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.supportService.tickets$.subscribe(data => {
      this.tickets = data;
    });
  }

  openNew(): void {
    this.ticketForm.reset({ priority: 'Medium' });
    this.showDialog = true;
  }

  viewTicket(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.viewTicketDialog = true;
  }

  loadTickets(): void {
    this.supportService.tickets$.subscribe(data => {
      this.tickets = data;
    });
  }

  saveTicket(): void {
    if (this.ticketForm.invalid) return;

    this.supportService.createTicket(this.ticketForm.value).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Support ticket created' });
      this.loadTickets();
      this.showDialog = false;
    });
  }

  updateStatus(id: string, status: TicketStatus): void {
    this.supportService.updateTicketStatus(id, status).subscribe(() => {
      this.messageService.add({ severity: 'info', summary: 'Status Updated', detail: `Ticket status set to ${status}` });
      this.loadTickets();
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedTicket) return;

    this.supportService.addComment(this.selectedTicket.id, 'Agent', this.newComment).subscribe(updatedTicket => {
        this.selectedTicket = updatedTicket;
        this.newComment = '';
        this.messageService.add({ severity: 'success', summary: 'Comment Added', detail: 'Your message has been sent' });
        this.loadTickets();
    });
  }

  deleteTicket(ticket: SupportTicket): void {
    if (confirm(`Are you sure you want to delete ticket ${ticket.id}?`)) {
      this.supportService.deleteTicket(ticket.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Ticket removed' });
        this.loadTickets();
      });
    }
  }

  getPrioritySeverity(priority: TicketPriority): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (priority) {
      case 'Low': return 'info';
      case 'Medium': return 'success';
      case 'High': return 'warning';
      case 'Urgent': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: TicketStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'Open': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'secondary';
      default: return 'secondary';
    }
  }
}

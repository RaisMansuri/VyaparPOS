import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { AuditService, AuditEntry } from '../../../core/services/audit.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CardModule,
    TooltipModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(AuditService);
  private exportService = inject(ExportService);
  logs: AuditEntry[] = [];
  loading: boolean = true;

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.auditService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  exportExcel() {
    this.exportService.exportToExcel(this.logs, 'Audit_Log_Export');
  }

  exportPDF() {
    const cols = [
      { header: 'Time', dataKey: 'timestamp' },
      { header: 'Action', dataKey: 'action' },
      { header: 'Entity', dataKey: 'entityType' },
      { header: 'User', dataKey: 'userId' },
      { header: 'IP', dataKey: 'ipAddress' }
    ];
    this.exportService.exportToPDF('System Audit History', cols, this.logs, 'Audit_Log_Export');
  }

  getActionSeverity(action: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (action.includes('CREATE')) return 'success';
    if (action.includes('UPDATE')) return 'info';
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('VOID')) return 'warn';
    return 'secondary';
  }
}

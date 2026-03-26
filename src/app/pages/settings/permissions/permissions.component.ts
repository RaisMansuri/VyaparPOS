import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PermissionService } from '../../../core/services/permission.service';
import { RoutePermission, UserRole } from '../../../models/permission.model';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CheckboxModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="permission-container p-4">
      <p-toast></p-toast>
      <div class="header mb-4">
        <h1 class="text-2xl font-bold mb-2">Role Permissions</h1>
        <p class="text-muted">Configure access controls for each role in your POS system.</p>
      </div>

      <p-card styleClass="shadow-2 border-round-xl overflow-hidden">
        <p-table [value]="localPermissions" responsiveLayout="scroll" styleClass="p-datatable-striped modern-permissions-table">
          <ng-template pTemplate="header">
            <tr>
              <th style="min-width: 250px">Resource / Page</th>
              <th class="text-center">Admin / Super</th>
              @for (role of configurableRoles; track role.name) {
                <th class="text-center">{{ role.label }}</th>
              }
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-perm>
            <tr>
              <td>
                <div class="flex align-items-center gap-3">
                  <div class="icon-circle shadow-1" [class]="perm.section">
                    <i [class]="perm.icon"></i>
                  </div>
                  <div class="flex flex-column">
                    <span class="font-bold text-900">{{ translationService.translate(perm.label) || perm.label }}</span>
                    <small class="text-500 font-mono">{{ perm.path }}</small>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <p-checkbox [binary]="true" [ngModel]="true" [disabled]="true"></p-checkbox>
                <div class="text-xs text-primary font-medium mt-1">Full Access</div>
              </td>
              @for (role of configurableRoles; track role.name) {
                <td class="text-center">
                  <p-checkbox [binary]="true" [(ngModel)]="perm.roles[role.name]" (onChange)="onToggle(perm, role.name)"></p-checkbox>
                </td>
              }
            </tr>
          </ng-template>
        </p-table>

        <div class="flex btn-group p-4 mt-2 border-top-1 border-gray-100 gap-4 bg-gray-50">
          <button pButton label="Save All Changes" icon="pi pi-check" (click)="saveChanges()" class="p-button-success p-button-rounded shadow-2 px-4"></button>
          <button pButton label="Reset to Defaults" icon="pi pi-refresh" class="p-button-outlined p-button-secondary p-button-rounded px-4" (click)="resetDefaults()"></button>
          <button pButton label="Clear All Permissions" icon="pi pi-trash" class="p-button-outlined p-button-danger p-button-rounded px-4" (click)="clearAllPermissions()"></button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .permission-container { max-width: 1400px; margin: 0 auto; }
    .text-center { text-align: center; }
    .icon-circle { 
        width: 32px; height: 32px; border-radius: 8px; 
        display: flex; align-items: center; justify-content: center;
        background: #f8fafc; color: #475569;
    }
    .icon-circle.management { background: #eef2ff; color: #4f46e5; }
    .icon-circle.inventory { background: #ecfdf5; color: #10b981; }
    .icon-circle.shopping { background: #fff7ed; color: #f97316; }
    .icon-circle.settings { background: #fef2f2; color: #ef4444; }
    .icon-circle.overview { background: #faf5ff; color: #a855f7; }
    
    :host ::ng-deep .modern-permissions-table .p-datatable-thead > tr > th {
        background: #ffffff;
        padding: 1.5rem 1rem;
        border-bottom: 2px solid #f1f5f9;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.025em;
    }
    :host ::ng-deep .modern-permissions-table .p-datatable-tbody > tr > td {
        padding: 1.25rem 1rem;
    }
        .btn-group{
          display: flex;
          justify-content: end;
          gap: 10px;
          margin-top: 20px;
        }
  `]
})
export class PermissionsComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private messageService = inject(MessageService);
  public translationService = inject(TranslationService);

  localPermissions: any[] = [];

  configurableRoles = [
    { name: 'manager', label: 'Manager' },
    { name: 'cashier', label: 'Cashier' },
    { name: 'inventory_manager', label: 'Inventory' },
    { name: 'accountant', label: 'Accountant' },
    { name: 'delivery_staff', label: 'Delivery' },
    { name: 'customer', label: 'Customer' }
  ];

  ngOnInit() {
    this.permissionService.permissions$.subscribe(perms => {
      this.localPermissions = perms.map(p => {
        const roleMap: any = {};
        this.configurableRoles.forEach(r => {
          roleMap[r.name] = p.allowedRoles.includes(r.name as UserRole);
        });
        return {
          ...p,
          roles: roleMap
        };
      });
    });
  }

  onToggle(perm: any, role: string) {
    // Reactive mapping logic
  }

  clearAllPermissions() {
    this.localPermissions.forEach(p => {
      Object.keys(p.roles).forEach(r => {
        p.roles[r] = false;
      });
    });
    this.messageService.add({
      severity: 'info',
      summary: 'Permissions Cleared Locally',
      detail: 'Click Save All Changes to persist the reset.'
    });
  }

  saveChanges() {
    const updated: RoutePermission[] = this.localPermissions.map(p => ({
      path: p.path,
      label: p.label,
      icon: p.icon,
      section: p.section,
      badge: p.badge,
      requiredFeature: p.requiredFeature,
      requiredPermission: p.requiredPermission,
      allowedRoles: this.getRoles(p)
    }));

    this.permissionService.savePermissions(updated);
    this.messageService.add({
      severity: 'success',
      summary: 'Permissions Updated',
      detail: 'Sidebar access rules have been successfully applied.'
    });
  }

  private getRoles(p: any): UserRole[] {
    const roles: UserRole[] = ['superadmin', 'owner', 'admin'];
    this.configurableRoles.forEach(r => {
      if (p.roles[r.name]) {
        roles.push(r.name as UserRole);
      }
    });
    return roles;
  }

  resetDefaults() {
    window.localStorage.removeItem('vyaparpos_route_permissions');
    window.location.reload();
  }
}

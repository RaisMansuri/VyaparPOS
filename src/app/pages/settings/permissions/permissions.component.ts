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
      <p-card header="Role-wise Page Permissions" subheader="Configure which roles can access specific sidebar menus.">
        <p-table [value]="localPermissions" responsiveLayout="scroll" styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>Page / Route</th>
              <th class="text-center">Owner</th>
              <th class="text-center">Manager</th>
              <th class="text-center">Cashier</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-perm>
            <tr>
              <td>
                <div class="flex align-items-center gap-2">
                  <i [class]="perm.icon"></i>
                  <span>{{ perm.label.startsWith('DASHBOARD') || perm.label.startsWith('REPORTS') || perm.label.startsWith('CUSTOMERS') ? translationService.translate(perm.label) : perm.label }}</span>
                </div>
                <small class="text-muted">{{ perm.path }}</small>
              </td>
              <td class="text-center">
                <p-checkbox [binary]="true" [ngModel]="true" [disabled]="true"></p-checkbox>
                <small class="block text-xs mt-1">(Always Allowed)</small>
              </td>
              <td class="text-center">
                <p-checkbox [binary]="true" [(ngModel)]="perm.isManager" (onChange)="onToggle(perm, 'manager')"></p-checkbox>
              </td>
              <td class="text-center">
                <p-checkbox [binary]="true" [(ngModel)]="perm.isCashier" (onChange)="onToggle(perm, 'cashier')"></p-checkbox>
              </td>
            </tr>
          </ng-template>
        </p-table>

        <div class="flex justify-content-end mt-4 gap-2">
          <button pButton label="Reset Defaults" icon="pi pi-refresh" class="p-button-outlined p-button-secondary" (click)="resetDefaults()"></button>
          <button pButton label="Save Changes" icon="pi pi-check" (click)="saveChanges()"></button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .permission-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .text-center { text-align: center; }
    .text-muted { color: #6c757d; font-size: 0.8rem; }
  `]
})
export class PermissionsComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private messageService = inject(MessageService);
  public translationService = inject(TranslationService);

  localPermissions: any[] = [];

  ngOnInit() {
    this.permissionService.permissions$.subscribe(perms => {
      this.localPermissions = perms.map(p => ({
        ...p,
        isManager: p.allowedRoles.includes('manager'),
        isCashier: p.allowedRoles.includes('cashier')
      }));
    });
  }

  onToggle(perm: any, role: UserRole) {
    // Logic is handled by ngModel, but we can add validation here if needed
  }

  saveChanges() {
    const updated: RoutePermission[] = this.localPermissions.map(p => ({
      path: p.path,
      label: p.label,
      icon: p.icon,
      section: p.section,
      badge: p.badge,
      requiredFeature: p.requiredFeature,
      allowedRoles: this.getRoles(p)
    }));

    this.permissionService.savePermissions(updated);
    this.messageService.add({
      severity: 'success',
      summary: 'Permissions Updated',
      detail: 'Sidebar menu will now update based on these settings.'
    });
  }

  private getRoles(p: any): UserRole[] {
    const roles: UserRole[] = ['owner'];
    if (p.isManager) roles.push('manager');
    if (p.isCashier) roles.push('cashier');
    return roles;
  }

  resetDefaults() {
    // Reload from default in service if we add a reset method, 
    // for now we can just clear localStorage and reload page or call service method
    // I'll just reload the page for simplicity or call a service reset if I had one.
    window.localStorage.removeItem('vyaparpos_route_permissions');
    window.location.reload();
  }
}

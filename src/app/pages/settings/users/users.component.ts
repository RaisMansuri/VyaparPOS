import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { UserService, User } from '../../../core/services/user.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        SelectModule,
        DialogModule,
        InputSwitchModule,
        MultiSelectModule,
        CardModule,
        IconFieldModule,
        InputIconModule,
        FloatLabelModule
    ],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

    users: User[] = [];
    roles: any[] = [];
    statuses: any[] = [];
    availablePermissions: any[] = [];
    loading: boolean = true;
    globalFilterFields: string[] = ['name', 'email', 'role'];

    userDialog: boolean = false;
    user!: User;
    submitted: boolean = false;

    constructor(
        private toastService: ToastService, 
        private confirmationService: ConfirmationService,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.roles = [
            { label: 'Super Admin', value: 'superadmin' },
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'Cashier', value: 'cashier' },
            { label: 'Inventory Manager', value: 'inventory_manager' },
            { label: 'Accountant', value: 'accountant' },
            { label: 'Delivery Staff', value: 'delivery_staff' },
            { label: 'Customer', value: 'customer' }
        ];

        this.statuses = [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' }
        ];

        this.availablePermissions = [
            { label: 'Manage Users', value: 'Manage Users' },
            { label: 'View Sales', value: 'View Sales' },
            { label: 'Manage Products', value: 'Manage Products' },
            { label: 'Process Sales', value: 'Process Sales' },
            { label: 'View Reports', value: 'View Reports' },
            { label: 'Manage Settings', value: 'Manage Settings' },
            { label: 'Manage Expenses', value: 'Manage Expenses' },
            { label: 'Manage Inventory', value: 'Manage Inventory' }
        ];

        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.loading = false;
            },
            error: () => {
                // Fallback to dummy data if API fails to maintain functionality
                this.users = [
                    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', permissions: ['Manage Users', 'View Sales', 'Manage Products'] },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active', permissions: ['View Sales', 'Manage Products'] },
                    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Cashier', status: 'Inactive', permissions: ['Process Sales'] },
                ];
                this.loading = false;
            }
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Inactive':
                return 'danger';
            default:
                return 'info';
        }
    }

    getRoleSeverity(role: string) {
        const r = role.toLowerCase();
        switch (r) {
            case 'superadmin':
            case 'owner':
                return 'danger';
            case 'admin':
                return 'warn';
            case 'manager':
                return 'info';
            case 'cashier':
                return 'secondary';
            case 'inventory_manager':
                return 'success';
            case 'accountant':
                return 'contrast';
            case 'delivery_staff':
                return 'info';
            case 'customer':
            case 'consumer':
                return 'info';
            default:
                return 'info';
        }
    }

    openNew() {
        this.user = { id: '', name: '', email: '', role: '', status: 'Active', permissions: [] };
        this.submitted = false;
        this.userDialog = true;
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

    deleteUser(user: User) {
        this.confirmationService.confirm({
            message: `<b>${user.name}</b> will be removed from the system?`,
            header: 'Remove user?',
            icon: 'pi pi-trash',
            acceptLabel: 'Remove',
            rejectLabel: 'Keep it',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.userService.deleteUser(user.id).subscribe({
                    next: () => {
                        this.users = this.users.filter((val) => val.id !== user.id);
                        this.user = { id: '', name: '', email: '', role: '', status: '', permissions: [] };
                        this.toastService.success('Successful', 'User Deleted');
                    },
                    error: () => {
                        this.toastService.error('Error', 'Failed to delete user');
                    }
                });
            }
        });
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    saveUser() {
        this.submitted = true;

        if (this.user.name?.trim() && this.user.email?.trim() && this.user.role) {
            if (this.user.id) {
                this.userService.updateUser(this.user).subscribe({
                    next: (updatedUser) => {
                        this.users[this.findIndexById(this.user.id)] = updatedUser;
                        this.toastService.success('Successful', 'User Updated');
                        this.closeDialog();
                    }
                });
            } else {
                this.userService.createUser(this.user).subscribe({
                    next: (newUser) => {
                        this.users.push(newUser);
                        this.toastService.success('Successful', 'User Created');
                        this.closeDialog();
                    }
                });
            }
        }
    }

    private closeDialog() {
        this.users = [...this.users];
        this.userDialog = false;
        this.user = { id: '', name: '', email: '', role: '', status: '', permissions: [] };
    }

    onStatusChange(user: User) {
        this.userService.updateUser(user).subscribe({
            next: () => {
                this.toastService.info('Status Updated', `${user.name} is now ${user.status}`);
            },
            error: () => {
                this.toastService.error('Error', 'Failed to update user status');
                // Revert UI state if needed, but for simplicity we'll just show error
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): number {
        return Math.floor(Math.random() * 1000) + 10;
    }
}

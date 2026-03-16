import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    permissions: string[];
}

@Component({
    selector: 'app-users',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        DropdownModule,
        DialogModule,
        InputSwitchModule,
        MultiSelectModule,
        ToastModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule
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

    constructor(private messageService: MessageService, private confirmationService: ConfirmationService) { }

    ngOnInit() {
        this.roles = [
            { label: 'Admin', value: 'Admin' },
            { label: 'Manager', value: 'Manager' },
            { label: 'Cashier', value: 'Cashier' }
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
            { label: 'Manage Settings', value: 'Manage Settings' }
        ];

        // Dummy data
        this.users = [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', permissions: ['Manage Users', 'View Sales', 'Manage Products'] },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active', permissions: ['View Sales', 'Manage Products'] },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Cashier', status: 'Inactive', permissions: ['Process Sales'] },
            { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Cashier', status: 'Active', permissions: ['Process Sales'] },
            { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', status: 'Active', permissions: ['View Sales', 'Manage Products'] },
        ];

        this.loading = false;
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
        switch (role) {
            case 'Admin':
                return 'warn';
            case 'Manager':
                return 'info';
            case 'Cashier':
                return 'secondary';
            default:
                return 'info';
        }
    }

    openNew() {
        this.user = { id: 0, name: '', email: '', role: '', status: 'Active', permissions: [] };
        this.submitted = false;
        this.userDialog = true;
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

    deleteUser(user: User) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + user.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.users = this.users.filter((val) => val.id !== user.id);
                this.user = { id: 0, name: '', email: '', role: '', status: '', permissions: [] };
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
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
                // Update
                this.users[this.findIndexById(this.user.id)] = this.user;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
            } else {
                // Create
                this.user.id = this.createId();
                this.users.push(this.user);
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
            }

            // Force refresh array for table detect changes
            this.users = [...this.users];
            this.userDialog = false;
            this.user = { id: 0, name: '', email: '', role: '', status: '', permissions: [] };
        }
    }

    onStatusChange(user: User) {
        this.messageService.add({ severity: 'info', summary: 'Status Updated', detail: `${user.name} is now ${user.status}`, life: 2000 });
    }

    findIndexById(id: number): number {
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

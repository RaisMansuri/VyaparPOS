import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    permissions: string[];
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users`;

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    updateUser(user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}

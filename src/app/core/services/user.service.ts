import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id: string;
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
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => res.data || [])
        );
    }

    createUser(user: User): Observable<User> {
        return this.http.post<any>(this.apiUrl, user).pipe(
            map(res => res.data)
        );
    }

    updateUser(user: User): Observable<User> {
        return this.http.put<any>(`${this.apiUrl}/${user.id}`, user).pipe(
            map(res => res.data)
        );
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    uploadAvatar(file: File): Observable<{ data: { url: string } }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'avatars');
        return this.http.post<{ data: { url: string } }>(`${environment.apiUrl}/upload`, formData);
    }

    updateProfile(data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
            map(res => res.data)
        );
    }
}

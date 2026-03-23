import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any; // To store QR data, invoice details, etc.
}

export interface AiAction {
  type: 'NAVIGATE' | 'QUERY' | 'HELP' | 'NONE' | 'ADD_TO_CART' | 'GENERATE_QR' | 'SHOW_INVOICE' | 'CHECK_DETAILS' | 'ADD_PRODUCT' | 'ADD_MULTIPLE_PRODUCTS' | 'ADD_CATEGORY' | 'ADD_MULTIPLE_CATEGORIES' | 'SHOW_PRODUCTS' | 'SHOW_CATEGORIES' | 'CONFIRMATION';
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AiAgentService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Calls the backend AI Agent for a real LLM response.
   */
  processMessage(message: string, history: AiMessage[] = []): Observable<{ response: string; action?: AiAction }> {
    const apiUrl = `${environment.apiUrl}/ai/chat`;
    const user = this.authService.getCurrentUser() as any;
    const currentUserId = user?.id || user?._id;
    
    const payload = { 
      message, 
      userId: currentUserId,
      history: history.slice(-5).map(m => ({ role: m.role, content: m.content })) // Send last 5 messages for context
    };

    return this.http.post<any>(apiUrl, payload, { 
      headers: { 'X-Skip-Loader': 'true' } 
    }).pipe(
      map(res => {
        return res;
      }),
      catchError(err => {
        console.error('AI Service Error:', err);
        return of({ 
          response: "I'm having trouble connecting to my service right now. Please make sure the backend is running.",
          action: { type: 'HELP' as const }
        });
      })
    );
  }
}

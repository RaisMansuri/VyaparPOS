import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiAction {
  type: 'NAVIGATE' | 'QUERY' | 'HELP' | 'NONE';
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AiAgentService {
  private router = inject(Router);
  private http = inject(HttpClient);

  /**
   * Calls the backend AI Agent for a real LLM response.
   */
  processMessage(message: string, history: AiMessage[] = []): Observable<{ response: string; action?: AiAction }> {
    const apiUrl = `${environment.apiUrl}/ai/chat`;
    const payload = { 
      message, 
      history: history.slice(-5).map(m => ({ role: m.role, content: m.content })) // Send last 5 messages for context
    };

    return this.http.post<any>(apiUrl, payload).pipe(
      map(res => {
        // Handle navigation actions returned by the AI
        if (res.action?.type === 'NAVIGATE' && res.action.payload) {
          this.router.navigate([res.action.payload]);
        }
        return res;
      })
    );
  }
}

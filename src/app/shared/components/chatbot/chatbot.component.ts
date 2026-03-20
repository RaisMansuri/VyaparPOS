import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AiAgentService, AiMessage } from '../../../core/services/ai-agent.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  private aiService = inject(AiAgentService);

  isOpen = signal(false);
  userInput = signal('');
  messages = signal<AiMessage[]>([
    { role: 'assistant', content: 'Hi! I am your Vyapar AI assistant. How can I help you today?', timestamp: new Date() }
  ]);
  isTyping = signal(false);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    // Add user message
    this.messages.update(msgs => [...msgs, { role: 'user', content: text, timestamp: new Date() }]);
    this.userInput.set('');
    this.isTyping.set(true);

    // Process with AI Service
    setTimeout(() => {
      this.aiService.processMessage(text, this.messages()).subscribe(res => {
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: res.response, timestamp: new Date() }]);
        this.isTyping.set(false);
        this.scrollToBottom();
      });
    }, 600); // Small delay for "AI thinking" feel
  }

  quickAction(text: string) {
    this.userInput.set(text);
    this.sendMessage();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 100);
  }
}

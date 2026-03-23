import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { AiAgentService, AiMessage, AiAction } from '../../../core/services/ai-agent.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TooltipModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  private aiService = inject(AiAgentService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

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
      this.aiService.processMessage(text, this.messages()).subscribe({
        next: (res) => {
          const newMessage: AiMessage = { 
            role: 'assistant', 
            content: res.response, 
            timestamp: new Date(),
            metadata: res.action?.type !== 'NAVIGATE' ? res.action?.payload : null 
          };
          
          this.messages.update(msgs => [...msgs, newMessage]);
          this.isTyping.set(false);
          this.scrollToBottom();

          // Handle actions
          if (res && res.action) {
            this.handleAction(res.action);
          }
        },
        error: (err) => {
          console.error('Chatbot Error:', err);
          this.messages.update(msgs => [...msgs, { 
            role: 'assistant', 
            content: "Sorry, I'm having trouble connecting. Please check if the backend is running.", 
            timestamp: new Date() 
          }]);
          this.isTyping.set(false);
          this.scrollToBottom();
        }
      });
    }, 600);
  }

  quickAction(text: string) {
    this.userInput.set(text);
    this.sendMessage();
  }

  private handleAction(action: AiAction) {
    if (!action.payload) return;

    switch (action.type) {
      case 'NAVIGATE':
        setTimeout(() => {
          this.router.navigate([action.payload]);
        }, 1500);
        break;

      case 'ADD_TO_CART':
        if (action.payload.products) {
          this.handleAddMultipleToCart(action.payload.products);
        }
        break;

      case 'GENERATE_QR':
        // Metadata is already added to the message, UI will render it
        console.log('QR Code generated for:', action.payload.amount);
        break;

      case 'SHOW_INVOICE':
        // Metadata already added, showing success card
        break;
      case 'ADD_PRODUCT':
        this.handleAddProduct(action.payload);
        break;
      case 'ADD_MULTIPLE_PRODUCTS':
        this.handleAddMultipleProducts(action.payload);
        break;
      case 'ADD_CATEGORY':
        this.handleAddCategory(action.payload);
        break;
      case 'ADD_MULTIPLE_CATEGORIES':
        this.handleAddMultipleCategories(action.payload);
        break;
    }
  }

  private handleAddProduct(product: any): void {
    this.productService.addProduct(product).subscribe({
      next: () => {
        this.productService.refreshProducts();
      },
      error: (err: any) => console.error('Failed to add product via AI:', err)
    });
  }

  private handleAddMultipleProducts(payload: any): void {
    const products = payload.products || [];
    if (products.length === 0) return;

    const observables = products.map((p: any) => 
      this.productService.addProduct(p).pipe(catchError((err: any) => of(null)))
    );

    forkJoin(observables).subscribe({
      next: () => {
        this.productService.refreshProducts();
      },
      error: (err: any) => console.error('Failed to add multiple products via AI:', err)
    });
  }

  private handleAddCategory(category: any): void {
    this.categoryService.createCategory(category).subscribe({
      next: () => {
        // Updated via tap
      },
      error: (err: any) => console.error('Failed to add category via AI:', err)
    });
  }

  private handleAddMultipleCategories(payload: any): void {
    const categories = payload.categories || [];
    if (categories.length === 0) return;

    const observables = categories.map((c: any) => 
      this.categoryService.createCategory(c).pipe(catchError((err: any) => of(null)))
    );

    forkJoin(observables).subscribe({
      next: () => {
        // Updated via tap
      },
      error: (err: any) => console.error('Failed to add multiple categories via AI:', err)
    });
  }

  private handleAddMultipleToCart(items: any[]): void {
    this.productService.products$.subscribe(products => {
      items.forEach(item => {
        const product = products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()));
        if (product) {
          this.cartService.addToCart(product, item.quantity || 1);
        } else {
          console.warn('Product not found for AI request:', item.name);
        }
      });
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTo({
          top: chatBody.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
}

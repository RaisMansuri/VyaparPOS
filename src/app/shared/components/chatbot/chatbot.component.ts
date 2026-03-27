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
import { SupportService } from '../../../core/services/support.service';
import { AuthService } from '../../../auth/auth.service';
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
  private supportService = inject(SupportService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  userInput = signal('');
  messages = signal<AiMessage[]>([
    { role: 'assistant', content: 'Hi! I am your Vyapar AI assistant. How can I help you today?', timestamp: new Date() }
  ]);
  isTyping = signal(false);
  
  // Get cart data and system info for context
  private getLiveContext() {
    const products = this.productService.getProductsSnapshot();
    const availableProducts = products.map(p => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category
    }));

    const lastOrder = this.orderService.getLastOrder();
    const lastOrderContext = lastOrder ? {
      orderId: lastOrder.id,
      total: lastOrder.totalAmount,
      status: lastOrder.status,
      date: lastOrder.orderDate
    } : null;

    return {
      cart: {
        items: this.cartService.items(),
        total: this.cartService.cartTotal(),
        count: this.cartService.cartCount()
      },
      lastOrder: lastOrderContext,
      availableProducts: availableProducts,
      user: this.authService.getCurrentUser(),
      systemInstructions: `
        You are the Vyapar AI Assistant for a POS system.
        RULES:
        1. ONLY answer questions related to this business system (Sales, Products, Inventory, Orders, Support).
        2. Use the 'availableProducts' list provided in the context for accurate pricing and stock info.
        3. If a user asks to buy or add something, use the ADD_TO_CART action with the correct product names from 'availableProducts'.
        4. When reporting totals, ensure they match the 'price * quantity' of the products added.
        5. If the user message is personal or irrelevant to the POS system, politely say you can only help with business-related tasks.
        6. Be professional, concise, and 'proper' in your responses.
      `
    };
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.userInput().trim();
    if (!text) return;

    // Add user message
    this.messages.update(msgs => [...msgs, { role: 'user', content: text, timestamp: new Date() }]);
    this.userInput.set('');

    // Check if user is still logged in
    if (!this.authService.getCurrentUser()) {
      this.messages.update(msgs => [...msgs, { 
        role: 'assistant', 
        content: 'Your session has expired. Please log in again to use the AI assistant.', 
        timestamp: new Date() 
      }]);
      setTimeout(() => this.authService.logout(), 2000);
      return;
    }

    this.isTyping.set(true);
    
    // Process with AI Service
    setTimeout(() => {
      const context = this.getLiveContext();
      this.aiService.processMessage(text, this.messages(), context).subscribe({
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
          
          // Handle session expiration (401)
          if (err.status === 401) {
            this.messages.update(msgs => [...msgs, { 
              role: 'assistant', 
              content: 'Your session has expired! Redirecting to login...', 
              timestamp: new Date() 
            }]);
            setTimeout(() => this.authService.logout(), 2000);
            return;
          }

          this.messages.update(msgs => [...msgs, { 
            role: 'assistant', 
            content: "Sorry, I'm having trouble connecting. Please check if the backend is running or your API key is correct.", 
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
        this.cartService.clearCart();
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
      case 'SEND_INVOICE_EMAIL':
        this.sendInvoiceEmail(action.payload);
        break;
      case 'SHOW_PAYMENT_METHODS':
        // Handled by component template rendering
        break;
      case 'CREATE_TICKET':
        this.handleCreateTicket(action.payload);
        break;
    }
}

  private sendInvoiceEmail(payload: any) {
    if (!payload.email || !payload.orderId) return;
    
    this.aiService.sendInvoice(payload.orderId, payload.email).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, { 
          role: 'assistant', 
          content: res.message, 
          timestamp: new Date() 
        }]);
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to send invoice email:', err)
    });
  }

  private handleCreateTicket(payload: any) {
    if (!payload.subject) return;

    this.supportService.createTicket(payload).subscribe({
      next: (ticket) => {
        const newMessage: AiMessage = {
          role: 'assistant',
          content: `I've created a support ticket for you.`,
          timestamp: new Date(),
          metadata: { ...ticket, type: 'TICKET_CREATED' }
        };
        this.messages.update(msgs => [...msgs, newMessage]);
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to create ticket via AI:', err)
    });
  }

  sendTicketNotification(ticketId: string, type: 'email' | 'sms') {
    const user = this.authService.getCurrentUser() as any;
    const destination = type === 'email' ? user?.email : user?.phone;
    
    if (!destination) {
      this.messages.update(msgs => [...msgs, { 
        role: 'assistant', 
        content: `Sorry, I don't have your ${type} on file.`, 
        timestamp: new Date() 
      }]);
      return;
    }

    this.aiService.sendTicketInfo(ticketId, destination, type).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, { 
          role: 'assistant', 
          content: res.message || `Ticket details sent via ${type.toUpperCase()}!`, 
          timestamp: new Date() 
        }]);
        this.scrollToBottom();
      },
      error: (err) => console.error(`Failed to send ticket ${type}:`, err)
    });
  }

  downloadInvoice(metadata: any) {
    if (!metadata.orderId) return;
    
    this.router.navigate(['/orders', metadata.orderId, 'invoice'], { 
      queryParams: { action: 'download' } 
    });
    
    this.messages.update(msgs => [...msgs, { 
      role: 'assistant', 
      content: `Generating PDF for Order ${metadata.orderId}...`, 
      timestamp: new Date() 
    }]);
  }

  printInvoice(metadata: any) {
    if (!metadata.orderId) return;

    this.router.navigate(['/orders', metadata.orderId, 'invoice'], { 
      queryParams: { action: 'print' } 
    });
    
    this.messages.update(msgs => [...msgs, { 
      role: 'assistant', 
      content: `Opening Print View for Order ${metadata.orderId}...`, 
      timestamp: new Date() 
    }]);
  }

  viewOrderDetails(orderId: string) {
    this.router.navigate(['/orders', orderId]);
    this.isOpen.set(false);
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

  isConsumer(): boolean {
    return this.authService.isConsumer();
  }

  formatMessageDate(date: any): string {
    const d = new Date(date);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    if (d.toDateString() === now.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  isQrExpired(timestamp: Date): boolean {
    const diff = new Date().getTime() - new Date(timestamp).getTime();
    return diff > 5 * 60 * 1000; // 5 minutes
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

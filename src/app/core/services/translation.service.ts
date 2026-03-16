import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  
  private translations: any = {
    en: {
      'DASHBOARD': 'Dashboard',
      'PRODUCTS': 'Products',
      'CUSTOMERS': 'Customers',
      'REPORTS': 'Reports',
      'CATEGORIES': 'Categories',
      'LOGOUT': 'Logout',
      'LOW_STOCK_ALERT': 'Low Stock Alert',
      'INVENTORY_ALERTS': 'Inventory Alerts',
      'SEARCH_PRODUCTS': 'Search products...',
      'ADD_TO_CART': 'Add to Cart',
      'PRICE': 'Price',
      'QTY': 'Qty',
      'TOTAL': 'Total'
    },
    hi: {
      'DASHBOARD': 'डैशबोर्ड',
      'PRODUCTS': 'उत्पाद',
      'CUSTOMERS': 'ग्राहक',
      'REPORTS': 'रिपोर्ट',
      'CATEGORIES': 'श्रेणियां',
      'LOGOUT': 'लॉगआउट',
      'LOW_STOCK_ALERT': 'कम स्टॉक अलर्ट',
      'INVENTORY_ALERTS': 'इन्वेंटरी अलर्ट',
      'SEARCH_PRODUCTS': 'उत्पाद खोजें...',
      'ADD_TO_CART': 'कार्ट में जोड़ें',
      'PRICE': 'कीमत',
      'QTY': 'मात्रा',
      'TOTAL': 'कुल'
    }
  };

  get currentLang$(): Observable<string> {
    return this.currentLangSubject.asObservable();
  }

  setLanguage(lang: string): void {
    this.currentLangSubject.next(lang);
  }

  translate(key: string): string {
    const lang = this.currentLangSubject.getValue();
    return this.translations[lang][key] || key;
  }
}

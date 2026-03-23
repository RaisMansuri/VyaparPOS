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
      'OVERVIEW': 'Overview',
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
      'TOTAL': 'Total',
      'NOTIFICATIONS': 'Notifications',
      'MARK_ALL_READ': 'Mark all as read',
      'SEE_ALL': 'See all',
      'NO_NOTIFICATIONS': 'No new notifications',
      'INVENTORY_MANAGEMENT': 'Inventory Management',
      'SHOPPING': 'Shopping',
      'MANAGEMENT': 'Management',
      'HELP': 'Help & Support',
      'SETTINGS': 'Settings',
      'ACCOUNT': 'Account'
    },
    hi: {
      'DASHBOARD': 'डैशबोर्ड',
      'OVERVIEW': 'अवलोकन',
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
      'TOTAL': 'कुल',
      'NOTIFICATIONS': 'सूचनाएं',
      'MARK_ALL_READ': 'सभी को पढ़ा हुआ मानें',
      'SEE_ALL': 'सभी देखें',
      'NO_NOTIFICATIONS': 'कोई नई सूचना नहीं',
      'INVENTORY_MANAGEMENT': 'इन्वेंट्री प्रबंधन',
      'SHOPPING': 'खरीदारी',
      'MANAGEMENT': 'प्रबंधन',
      'HELP': 'सहायता और समर्थन',
      'SETTINGS': 'सेटिंग्स',
      'ACCOUNT': 'खाता'
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

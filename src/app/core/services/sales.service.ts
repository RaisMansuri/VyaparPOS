import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  getSalesByDay(): Observable<any> {
    return of({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Revenue',
          data: [12000, 15000, 11000, 18000, 22000, 30000, 28000],
          fill: false,
          borderColor: '#4bc0c0'
        },
        {
          label: 'Orders',
          data: [45, 52, 38, 65, 80, 110, 100],
          fill: false,
          borderColor: '#565656'
        }
      ]
    });
  }

  getSalesByCategory(): Observable<any> {
    return of({
      labels: ['Breads', 'Cakes', 'Pastries', 'Cookies', 'Drinks'],
      datasets: [
        {
          data: [300, 150, 200, 100, 80],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ]
        }
      ]
    });
  }

  getDailySalesReport(category?: any, productId?: any): Observable<any[]> {
    const today = new Date();
    const reports = [];
    
    // Simulating filtered data
    const multiplier = (category || productId) ? 0.4 : 1;

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        reports.push({
            date: date,
            orders: Math.floor((Math.random() * 50 + 20) * multiplier),
            revenue: Math.floor((Math.random() * 20000 + 10000) * multiplier),
            taxable: Math.floor((Math.random() * 15000 + 8000) * multiplier),
            gst: Math.floor((Math.random() * 3000 + 1000) * multiplier),
            profit: Math.floor((Math.random() * 5000 + 2000) * multiplier)
        });
    }
    
    return of(reports);
  }

  getProducts(): Observable<any[]> {
    return of([
        { id: 1, name: 'Fresh White Bread', category: 'Breads' },
        { id: 2, name: 'Whole Wheat Bread', category: 'Breads' },
        { id: 3, name: 'French Baguette', category: 'Breads' },
        { id: 6, name: 'Chocolate Cake', category: 'Cakes' },
        { id: 7, name: 'Vanilla Sponge Cake', category: 'Cakes' },
        { id: 11, name: 'Butter Croissant', category: 'Pastries' }
    ]);
  }

  getCategories(): Observable<string[]> {
      return of(['Breads', 'Cakes', 'Pastries', 'Cookies', 'Drinks']);
  }
}

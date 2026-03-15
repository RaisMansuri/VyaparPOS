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
}

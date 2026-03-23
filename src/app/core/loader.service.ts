import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private count = 0;

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  show(): void {
    this.count++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      this.loadingSubject.next(false);
    }
  }
}


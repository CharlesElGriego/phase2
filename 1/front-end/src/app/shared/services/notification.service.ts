import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  show: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  message: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  showError(error: { code: string; message: string }): void {
    this.message.next(error.message);
    this.show.next(true);
  }

  closeError(): void {
    this.message.next(null);
    this.show.next(false);
  }
}

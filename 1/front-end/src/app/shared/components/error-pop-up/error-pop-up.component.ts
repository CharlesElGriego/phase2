import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationService } from '../../services';

@Component({
  selector: 'app-error-pop-up',
  imports: [CommonModule],
  templateUrl: './error-pop-up.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true, 
})
export class ErrorPopUpComponent {
  showErrorWindow$ = this.notificationService.show;
  errorMessage$ = this.notificationService.message;
  constructor(private readonly notificationService: NotificationService) {}

  closeError(): void {
    this.notificationService.closeError();
  }
}

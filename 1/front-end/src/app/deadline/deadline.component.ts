import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DeadlineService } from '../shared/services';
import { take, tap } from 'rxjs';

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deadline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeadlineComponent {
  currentDate = signal(new Date());
  secondsLeft$ = this.deadlineService.getCountdown();
  deadlineDate = this.deadlineService.getDeadlineDate().pipe(take(2));
  constructor(private readonly deadlineService: DeadlineService) { }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeadlineService } from '../shared/services';

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deadline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeadlineComponent {
  secondsLeft$ = this.deadlineService.getCountdown();
  deadlineDate = this.deadlineService.getDeadlineDate();
  constructor(private readonly deadlineService: DeadlineService) {}
}

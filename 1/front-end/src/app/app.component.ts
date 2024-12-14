import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ErrorPopUpComponent } from './shared/components';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterModule, ErrorPopUpComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}

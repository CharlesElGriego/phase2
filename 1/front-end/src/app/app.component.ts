import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorPopUpComponent } from './shared/components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorPopUpComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}

import { Component } from '@angular/core';

/**
 * The root of the entire application
 * Reserved for logic that is application-wide
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class App {
  title = 'rolecall';
}

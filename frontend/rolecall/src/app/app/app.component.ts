import { Component } from '@angular/core';
import { constNavBarEntries } from 'src/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rolecall';
  navBarEntries = constNavBarEntries;
}

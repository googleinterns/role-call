import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class WelcomePage implements OnInit {

  constructor(
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  async ngOnInit(): Promise<void> {
  }

}

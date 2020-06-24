import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { constNavBarEntries } from 'src/constants';
import { AppTypes } from 'src/types';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side_nav.component.html',
  styleUrls: ['./side_nav.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        right: '70vw'
      })),
      state('closed', style({
        right: '100vw'
      })),
      transition('open => closed', [
        animate('0.15s')
      ]),
      transition('closed => open', [
        animate('0.15s')
      ]),
    ])
  ]
})
export class SideNav {

  // The static side nav data from src/constants.ts to use to build the navigation panels
  sideNavChildren: AppTypes.NavBarChild[] = constNavBarEntries;
  // Whether the nav side bar is open or not
  navIsOpen = false;

  // Opens the navigation sidebar
  openNav(): void {
    this.navIsOpen = true;
  }

  // Closes the navigation sidebar
  closeNav(): void {
    this.navIsOpen = false;
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { AppTypes } from 'src/types';
import { constNavBarEntries } from 'src/constants';
import { trigger, style, state, transition, animate } from '@angular/animations';
import { from } from 'rxjs';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
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
export class SideNavComponent implements OnInit {

  // The static side nav data from src/constants.ts to use to build the navigation panels
  sideNavChildren: AppTypes.NavBarChild[] = constNavBarEntries;
  // Whether the nav side bar is open or not
  navIsOpen = false;

  constructor() { }

  ngOnInit(): void {
  }

  // Opens the navigation sidebar
  openNav(): void {
    this.navIsOpen = true;
  }

  // Closes the navigation sidebar
  closeNav(): void {
    this.navIsOpen = false;
  }

}

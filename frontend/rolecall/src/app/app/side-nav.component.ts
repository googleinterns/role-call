import { animate, state, style, transition, trigger,
} from '@angular/animations';
import { Component } from '@angular/core';
import { constNavBarEntries } from 'src/constants';
import { NavBarChild } from 'src/types';

/**
 * The side navigation panel component.
 * This populates the navigation panel with
 * router links, as well as handles animating
 * the opening and closing.
 */
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        right: '75vw'
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
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SideNav {
  /**
   * The static sidenav data from src/constants.ts to use
   * to build the navigation panels.
   */
  menuOptions: NavBarChild[] = constNavBarEntries;

  /** Whether the nav side bar is open or not. */
  isNavOpen = false;

  /** Opens the navigation sidebar. */
  openNav = (): void => {
    this.isNavOpen = true;
  };

  /** Closes the navigation sidebar. */
  closeNav = (): void => {
    this.isNavOpen = false;
  };

}

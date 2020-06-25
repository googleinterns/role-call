import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SideNav } from './side_nav.component';


/**
 * The site-wide header that holds the menu bar, login information,
 * and anything else that needs to be accessed site-wide
 */
@Component({
  selector: 'app-site-header',
  templateUrl: './site_header.component.html',
  styleUrls: ['./site_header.component.scss']
})
export class SiteHeader {

  /** Reference to the nav bar */
  @Input() navBar: SideNav;
  /** The log in button */
  @ViewChild('loginButton') loginButton: ElementRef;

  /**
   * Toggles the open state of the nav side bar
   * when the menu button is clicked
   */
  onNavButtonClick() {
    this.navBar.isNavOpen ? this.navBar.closeNav() : this.navBar.openNav();
  }

}

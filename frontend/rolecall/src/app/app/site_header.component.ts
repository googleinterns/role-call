import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SideNavComponent } from './side_nav.component';

@Component({
  selector: 'app-site-header',
  templateUrl: './site_header.component.html',
  styleUrls: ['./site_header.component.scss']
})
export class SiteHeaderComponent implements OnInit {

  // Reference to the nav bar
  @Input() navBar: SideNavComponent;
  // The log in button
  @ViewChild('loginButton') loginButton: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  // Toggles the open state of the nav side bar
  // when the menu button is clicked
  onNavButtonClick() {
    this.navBar.navIsOpen ? this.navBar.closeNav() : this.navBar.openNav();
  }

}

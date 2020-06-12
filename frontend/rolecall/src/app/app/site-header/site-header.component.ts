import { Component, OnInit, Input } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss']
})
export class SiteHeaderComponent implements OnInit {

  @Input() navBar: SideNavComponent;

  constructor() { }

  ngOnInit(): void {
  }

  onNavButtonClick(){
    console.log("navBar");
    this.navBar.navIsOpen ? this.navBar.closeNav() : this.navBar.openNav();
  }

}

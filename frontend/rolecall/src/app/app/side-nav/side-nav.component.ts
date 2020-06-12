import { Component, OnInit, Input } from '@angular/core';
import { AppTypes } from 'src/types';
import { trigger, style, state, transition, animate } from '@angular/animations';

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

  @Input() sideNavChildren: AppTypes.NavBarChild[];
  navIsOpen = false;

  constructor() { }

  ngOnInit(): void {
  }

  openNav(): void {
    this.navIsOpen = true;
  }

  closeNav(): void {
    this.navIsOpen = false;
  }

}

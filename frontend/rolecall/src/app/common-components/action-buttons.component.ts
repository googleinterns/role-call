import { Component, Input, OnInit,
} from '@angular/core';

export type Activator = () => boolean;
export type Handler = () => void;
export type ItemHandler = (ix: number) => void;

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent implements OnInit {

  @Input() name = 'Object';

  @Input() aIcon = 'delete';
  @Input() aName = 'Delete';
  @Input() aAria = '';
  @Input() aTip = '';
  @Input() aActivator?: Activator;
  @Input() aHandler?: Handler;

  @Input() bIcon = 'add';
  @Input() bName = 'New';
  @Input() bAria = '';
  @Input() bTip = '';
  @Input() bActivator?: Activator;
  @Input() bHandler?: Handler;
  @Input() bMenuItems = [];
  @Input() bMenuHandler?: ItemHandler;

  @Input() cIcon = 'save';
  @Input() cName = 'Save';
  @Input() cAria = '';
  @Input() cTip = '';
  @Input() cActivator?: Activator;
  @Input() cHandler?: Handler;


  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.aAria = this.aAria || `${this.aName} ${this.name}`;
    this.aTip = this.aTip || this.aAria;
    this.bAria = this.bAria || `${this.bName} ${this.name}`;
    this.bTip = this.bTip || this.bAria;
    this.cAria = this.cAria || `${this.cName} ${this.name}`;
    this.cTip = this.cTip || this.cAria;
  }

  aActivate = (): boolean =>
    this.aActivator ? this.aActivator() : true;


  aHandle = (): void => {
    if (this.aHandler) { this.aHandler(); }
  };

  bActivate = (): boolean =>
    this.bActivator ? this.bActivator() : true;


  bHandle = (): void => {
    if (this.bHandler) { this.bHandler(); }
  };

  bMenuHandle = (ix: number): void => {
    if (this.bMenuHandler) { this.bMenuHandler(ix); }
  };

  cActivate = (): boolean =>
    this.cActivator ? this.cActivator() : true;


  cHandle = (): void => {
    if (this.cHandler) { this.cHandler(); }
  };

}

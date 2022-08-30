import { Component, Input, OnInit,
} from '@angular/core';

export type Activator = () => boolean;
export type Handler = () => void;
export type ItemHandler = (ix: number) => void;

@Component({
  selector: 'app-perf-buttons',
  templateUrl: './perf-buttons.component.html',
  styleUrls: ['./perf-buttons.component.scss']
})
export class PerfButtonsComponent implements OnInit {

  @Input() name = 'Object';

  @Input() backIcon = 'arrow_back';
  @Input() backName = 'Back';
  @Input() backAria = 'Go to Previous Step';
  @Input() backTip = '';
  @Input() backActivator?: Activator;
  @Input() backHandler?: Handler;


  @Input() forwardIcon = 'arrow_forward';
  @Input() forwardName = 'Forward';
  @Input() forwardAria = 'Go to Next Step';
  @Input() forwardTip = '';
  @Input() forwardActivator?: Activator;
  @Input() forwardHandler?: Handler;

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

  @Input() cIcon = 'save';
  @Input() cName = 'Save';
  @Input() cAria = '';
  @Input() cTip = '';
  @Input() cActivator?: Activator;
  @Input() cHandler?: Handler;


  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.backAria = this.backAria || `Go to Previous Step`;
    this.backTip = this.backTip || this.backAria;
    this.forwardAria = this.forwardAria || `Go to Next Step`;
    this.forwardTip = this.forwardTip || this.forwardAria;
    this.aAria = this.aAria || `${this.aName} ${this.name}`;
    this.aTip = this.aTip || this.aAria;
    this.bAria = this.bAria || `${this.bName} ${this.name}`;
    this.bTip = this.bTip || this.bAria;
    this.cAria = this.cAria || `${this.cName} ${this.name}`;
    this.cTip = this.cTip || this.cAria;
  }

  backActivate = (): boolean =>
    this.backActivator ? this.backActivator() : true;


  backHandle = (): void => {
    if (this.backHandler) { this.backHandler(); }
  };

  forwardActivate = (): boolean =>
    this.forwardActivator ? this.forwardActivator() : true;


  forwardHandle = (): void => {
    if (this.forwardHandler) { this.forwardHandler(); }
  };

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

  cActivate = (): boolean =>
  this.cActivator ? this.cActivator() : true;


  cHandle = (): void => {
  if (this.cHandler) { this.cHandler(); }
  };

}

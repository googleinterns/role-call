import { Component } from '@angular/core';
import { HelpModalService } from '../app/help/help_modal.service';

/**
 * The base component of the Homepage view. Arranges all
 * sub-components to create the homepage view.
 */
@Component({
  selector: 'app-homepage-base',
  templateUrl: './homepage_base.component.html',
  styleUrls: ['./homepage_base.component.scss']
})
export class HomepageBase { 

  constructor(private dialogService: HelpModalService) {}

  openDialog(): void {
    const options = {
      title: 'Dashboard',
      message: 'Dashboard Text',
      confirmText: 'Exit',
    };
    this.dialogService.open(options);
  }
}
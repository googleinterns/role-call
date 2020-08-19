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
      title: 'Dashboard Page',
      sections: ['Panels', 'Viewing/Editing a Performance', 'Performance Details', 'Pieces and Intermissions', 'Fill Casts', 'Finalize'],
      messages: [`For now, the left panel is empty, but in the future, it will display notifications. The middle panel displays
      recent performances while the right panel displays upcoming performances.`,
      `To view/edit the details of a performance, click on the "Go To" button. This will open the description pages of the 
      performance. Here, you can edit the following things:`,
      `These are the name, date/time, location, and description of the performance. To edit the date, click on the calendar icon of the date
      field to open a calendar. Click the date of the performance and adjust the time on the right to set the time/date. To edit the other
      fields, just click on them and type new information.`,
      `Drag and drop ballets and segements from the panel on the left in the order that you want. To delete a piece/segment, hit the delete icon 
      next to the ballet/segment. When you are done, hit the "next" button at the bottom right to go to the next page.`,
      `On this page, you fill in the casts for all the ballets and set the time length for all the segements. To fill casts, you can either drag
      and drop users into each position/cast from the user table at the bottom of the page or autofill the casts for a dance using the 
      "Autofill Cast" field at the top middle of the page. Select which premade cast you'd like to use in the dropdown
      to fill in all the casts for the ballet. The dancing cast for each ballet will automatically be the first cast. To change this, click
      the "Dancing Cast" field at the top left of the page to open a drop down and select which cast you want to dance. Lastly, input the length 
      of the ballet in minutes at the top right of the page in the "length" field at the top right of the page. For segments, setting a time
      length will be the only step. Do this for each ballet/segment and then hit the "next" button to go to the next page`,
      `On this page, you will be asked to review the casting of the performance. If you are satisfied with each performing cast, hit the "publish"
      button on the bottom right to publish the performance. If there is an error, hit the "previous" button to go back to the casting page and
      make the necessary edits.`,
    ],

      confirmText: 'Exit',
    };
    this.dialogService.open(options);
  }
}
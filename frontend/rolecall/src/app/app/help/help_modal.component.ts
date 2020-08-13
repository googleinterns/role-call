import { ChangeDetectionStrategy, Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-confirm-dialog',
  templateUrl: './help_modal.component.html',
  styleUrls: ['./help_modal.component.scss']
})
export class HelpModalComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
                  confirmText: string,
                  message: string,
                  title: string
              }, private mdDialogRef: MatDialogRef<HelpModalComponent>) { }

  //Conditions that close the help modal
  public close(value) {
    this.mdDialogRef.close(value);
  }

  public confirm() {
    this.close(true);
  }
  
  @HostListener("keydown.esc") 
  public onEsc() {
    this.close(false);
  }
}
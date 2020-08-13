import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HelpModalComponent } from './help_modal.component';

@Injectable()
export class HelpModalService {
  constructor(private dialog: MatDialog) { }
  dialogRef: MatDialogRef<HelpModalComponent>;
  
  public open(options) {
    this.dialogRef = this.dialog.open(HelpModalComponent, {    
         data: {
           title: options.title, //Modal Title/Header
           message: options.message, //Modal Body Text
           confirmText: options.confirmText //'Ok' Button
         }
    });
  }
}
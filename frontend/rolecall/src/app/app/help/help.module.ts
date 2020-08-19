import { CommonModule } from '@angular/common';
import { NgModule} from '@angular/core';
import { HelpModalService } from './help_modal.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HelpModalComponent } from './help_modal.component';


@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
    ],
    declarations: [
        HelpModalComponent,
    ],
    exports: [HelpModalComponent],
    entryComponents: [HelpModalComponent],
    providers: [HelpModalService]
  })
  export class HelpModule {}
     
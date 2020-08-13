import { CommonModule } from '@angular/common';
import { NgModule} from '@angular/core';
import { HelpModalService } from './help_modal.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HelpModalComponent } from './help_modal.component';


@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    declarations: [
        HelpModalComponent,
    ],
    exports: [HelpModalComponent],
    entryComponents: [HelpModalComponent],
    providers: [HelpModalService]
  })
  export class HelpModule {}

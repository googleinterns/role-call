import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CommonComponentsModule,
} from '../common-components/common-components.module';
import { Dashboard } from './dashboard.component';
import { HomepageBase } from './homepage-base.component';


@NgModule({
  declarations: [HomepageBase, Dashboard],
  imports: [
    CommonModule,
    CommonComponentsModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [HomepageBase]
})
export class HomepageModule {
}

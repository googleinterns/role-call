import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Inject, Injectable, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef,
} from '@angular/material/dialog';
import { LoginApi } from '../api/login-api.service';
import { lastValueFrom } from 'rxjs';

export type ErrorEvent = {
  url: string;
  errorMessage: string;
  status: number;
  statusText: string;
};

@Injectable({providedIn: 'root'})
export class ResponseStatusHandlerService {

  pendingErrors:
    Map<string,
        [Promise<string>, (value?: string | PromiseLike<string>) => void]> =
    new Map();

  constructor(
    public dialog: MatDialog,
    private loginAPI: LoginApi,
  ) {
  }

  checkResponse = async <T>(response: HttpResponse<T>): Promise<T> =>
    new Promise(async (res, rej) => {
      await this.doCheck<T>(response, res, rej);
    });


  showError = async (errorEvent: ErrorEvent): Promise<string> => {
    if (this.pendingErrors.has(errorEvent.url)) {
      // TODO: What should we return here?
      return Promise.resolve('');
    }
    let resFunc;
    const prom: Promise<string> = new Promise(res => {
      resFunc = res;
    });
    this.pendingErrors.set(errorEvent.url, [prom, resFunc]);
    const dialogRef = this.dialog.open(ErrorDialog,
        { width: '50%', data: {errorEvent} });
    return lastValueFrom(dialogRef.afterClosed()).then(() => prom);
  };

  resolveError = (errEv: ErrorEvent, userResp: string): void => {
    const resolveThis = this.pendingErrors.get(errEv.url);
    if (resolveThis) {
      resolveThis[1](userResp);
      this.pendingErrors.delete(errEv.url);
    }
  };

  // Private methods

  private doCheck = async <T>(
    response: HttpResponse<T>,
    res: (value?: T | PromiseLike<T>) => void,
    rej: (reason?: any) => void
  ): Promise<void> => {

    if (response.status === 401) {
      rej('');
      this.loginAPI.signOut().then(() => {
console.log('Loggong out and in again');
        //this.loginAPI.login();
        this.loginAPI.isAuthLoaded = false;
        this.loginAPI.scheduleLogin();
      });
      return;
    }

    if (response.status < 200 || response.status > 299) {
      const rsp = response as any;
      const errorEvent: ErrorEvent = {
        url: response.url,
        errorMessage: rsp.error
          ? rsp.error.error
          : rsp.message,
        status: response.status,
        statusText: response.statusText,
      };
      const userResp = await this.showError(errorEvent);
      rej(userResp);
    } else {
      res(response.body);
    }
  };

}

export interface ErrorDialogData {
  errorEvent: ErrorEvent;
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.html',
  styleUrls: ['./error-dialog.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ErrorDialog {

  constructor(
      public dialogRef: MatDialogRef<ErrorDialog>,
      @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData,
      private respHandler: ResponseStatusHandlerService,
  ) {
  }

  onOkClick = (userResp: string): void => {
    this.respHandler.resolveError(this.data.errorEvent, userResp);
    this.dialogRef.close();
  };
}

@NgModule(
    {
      declarations: [ErrorDialog],
      imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
      ]
    })
export class DialogModule {
}

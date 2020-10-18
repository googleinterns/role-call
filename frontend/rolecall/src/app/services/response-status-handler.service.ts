import {CommonModule} from '@angular/common';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Component, Inject, Injectable, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {LoginApi} from '../api/login_api.service';

export type ErrorEvent = {
  url: string,
  errorMessage: string,
  status: number,
  statusText: string
};

export type WarningEvent = {
  warning: string
};

@Injectable({providedIn: 'root'})
export class ResponseStatusHandlerService {

  constructor(public dialog: MatDialog, private loginAPI: LoginApi) {
  }

  pendingErrors:
      Map<string,
          [Promise<string>, (value?: string | PromiseLike<string>) => void]> =
      new Map();

  checkResponse<T>(response: HttpResponse<T>): Promise<T> {
    return new Promise(async (res, rej) => {
      await this.doCheck<T>(response, res, rej);
    });
  }

  private async doCheck<T>(
      response: HttpResponse<T>,
      res: (value?: T | PromiseLike<T>) => void,
      rej: (reason?: any) => void
  ) {

    if (response.status === 401) {
      rej('');
      this.loginAPI.signOut().then(() => {
        this.loginAPI.login(true);
      });
      return;
    }

    if (response.status < 200 || response.status > 299) {
      const errorEvent: ErrorEvent = {
        url: response.url,
        errorMessage: response['error'] ? response['error']['error'] :
            response['message'],
        status: response.status,
        statusText: response.statusText
      };
      const userResp = await this.showError(errorEvent);
      rej(userResp);
    } else {
      res(response.body);
    }
  }

  showError(errorEvent: ErrorEvent): Promise<string> {
    if (this.pendingErrors.has(errorEvent.url)) {
      // TODO: What should we return here?
      // Is here a problem?
      return Promise.resolve('');
    }
    let resFunc;
    const prom: Promise<string> = new Promise((res, rej) => {
      resFunc = res;
    });
    this.pendingErrors.set(errorEvent.url, [prom, resFunc]);
    const dialogRef = this.dialog.open(ErrorDialog,
        {width: '50%', data: {errorEvent}});
    return dialogRef.afterClosed().toPromise().then(() => prom);
  }

  resolveError(errEv: ErrorEvent, userResp: string) {
    const resolveThis = this.pendingErrors.get(errEv.url);
    if (resolveThis) {
      resolveThis[1](userResp);
      this.pendingErrors.delete(errEv.url);
    }
  }

  noConnectionError(err: HttpErrorResponse) {
    const errorEvent: ErrorEvent = {
      url: err.url,
      errorMessage: err.message,
      status: err.status,
      statusText: err.statusText
    };
    this.showError(errorEvent);
  }
}

export interface ErrorDialogData {
  errorEvent: ErrorEvent;
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.html',
  styleUrls: ['./error-dialog.scss']
})
export class ErrorDialog {

  constructor(
      public dialogRef: MatDialogRef<ErrorDialog>,
      @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData,
      private respHandler: ResponseStatusHandlerService) {
  }

  onOkClick(userResp: string): void {
    this.respHandler.resolveError(this.data.errorEvent, userResp);
    this.dialogRef.close();
  }
}

@NgModule(
    {
      declarations: [ErrorDialog],
      imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule
      ]
    })
export class DialogModule {
}

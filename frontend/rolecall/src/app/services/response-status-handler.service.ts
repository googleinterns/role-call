import { HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';

export type ErrorEvent = {
  id: number,
  error: string
}

export type WarningEvent = {
  warning: string
}

@Injectable({
  providedIn: 'root'
})
export class ResponseStatusHandlerService {

  constructor() { }

  errorEmitter: EventEmitter<ErrorEvent> = new EventEmitter();
  pendingErrors: Map<number, [Promise<string>, (value?: string | PromiseLike<string>) => void]> = new Map();
  msgNum = 0;

  checkResponse<T>(response: HttpResponse<T>): Promise<T> {
    let prom: Promise<T> = new Promise(async (res, rej) => {
      await this.doCheck<T>(response, res, rej);
    });
    return prom;
  }

  private async doCheck<T>(response: HttpResponse<T>,
    res: (value?: T | PromiseLike<T>) => void,
    rej: (reason?: any) => void
  ) {

    console.log(response);

    if (response.status != 200) {
      let userResp = await this.showError(response.statusText);
      rej(response.statusText);
    } else {
      res(response.body);
    }
  }

  showError(text: string) {
    let resFunc;
    let prom: Promise<string> = new Promise((res, rej) => {
      resFunc = res;
    });
    let errorEvent: ErrorEvent = {
      id: this.msgNum,
      error: text
    }
    this.pendingErrors.set(errorEvent.id, [prom, resFunc]);
    this.msgNum++;
    this.errorEmitter.emit(errorEvent);
    console.log(errorEvent);
    return prom;
  }

  resolveError(errEv: ErrorEvent, userResp: string) {
    let resolveThis = this.pendingErrors.get(errEv.id);
    if (resolveThis) {
      resolveThis[1](userResp);
      this.pendingErrors.delete(errEv.id);
    }
  }

  noConnectionError(err) {
    this.showError(err);
  }

}
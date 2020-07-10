import { Injectable } from '@angular/core';

/** Logging prefixes */
export const ERROR_PREFIX = "{{ ERROR }} :: ";
export const WARN_PREFIX = "{{ WARN }} :: ";
export const INFO_PREFIX = "{{ INFO }} :: ";
export const LOG_PREFIX = "{{ LOG }} :: ";

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  /** Logs an error */
  public logError(err: any) {
    console.log(ERROR_PREFIX + err);
  }
  /** Logs a warning */
  public logWarn(warn: any) {
    console.log(WARN_PREFIX + warn);
  }
  /** Logs information */
  public logInfo(info: any) {
    console.log(INFO_PREFIX + info);
  }
  /** Logs a general log */
  public log(log: any) {
    console.log(LOG_PREFIX + log);
  }

}

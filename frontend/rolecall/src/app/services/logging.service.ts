import { Injectable } from '@angular/core';

/** Logging prefixes */
const ERROR_PREFIX = "{{ ERROR }} :: ";
const WARN_PREFIX = "{{ WARN }} :: ";
const INFO_PREFIX = "{{ INFO }} :: ";
const LOG_PREFIX = "{{ LOG }} :: ";

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

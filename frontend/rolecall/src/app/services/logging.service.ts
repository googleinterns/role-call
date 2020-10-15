import {Injectable} from '@angular/core';

/** Logging prefixes. */
export const ERROR_PREFIX = '{{ ERROR }} :: ';
export const WARN_PREFIX = '{{ WARN }} :: ';
export const LOG_PREFIX = '{{ LOG }} :: ';

@Injectable({providedIn: 'root'})
export class LoggingService {
  /** Logs an error. */
  public logError(err: any) {
    console.error(ERROR_PREFIX, err);
  }

  /** Logs a warning. */
  public logWarn(warn: any) {
    console.warn(WARN_PREFIX, warn);
  }

  /** Logs a general log. */
  public log(log: any) {
    console.log(LOG_PREFIX, log);
  }
}

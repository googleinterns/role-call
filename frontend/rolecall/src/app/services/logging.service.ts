import {Injectable} from '@angular/core';

/** Logging prefixes. */
export const ERROR_PREFIX = '{{ ERROR }} :: ';
export const WARN_PREFIX = '{{ WARN }} :: ';
export const LOG_PREFIX = '{{ LOG }} :: ';

@Injectable({providedIn: 'root'})
export class LoggingService {
  /** Logs an error. */
  public logError = (err: any): void => {
    console.error(ERROR_PREFIX, err);
  };

  /** Logs a warning. */
  public logWarn = (warn: any): void => {
    console.warn(WARN_PREFIX, warn);
  };

  /** Logs a general log. */
  public log = (log: any): void => {
    console.log(LOG_PREFIX, log);
  };
}

import { TestBed } from '@angular/core/testing';
import { ERROR_PREFIX, INFO_PREFIX, LoggingService, LOG_PREFIX, WARN_PREFIX } from './logging.service';


describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);
    spyOn(window.console, 'log');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call console log for each log type', () => {
    let testMessage = "TEST_MSG";
    service.log(testMessage);

    expect(window.console.log).toHaveBeenCalledWith(LOG_PREFIX + testMessage);

    service.logInfo(testMessage);

    expect(window.console.log).toHaveBeenCalledWith(INFO_PREFIX + testMessage);

    service.logWarn(testMessage);

    expect(window.console.log).toHaveBeenCalledWith(WARN_PREFIX + testMessage);

    service.logError(testMessage);

    expect(window.console.log).toHaveBeenCalledWith(ERROR_PREFIX + testMessage);
  });

});

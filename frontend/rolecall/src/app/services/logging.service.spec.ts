import { ERROR_PREFIX, LOG_PREFIX, LoggingService, WARN_PREFIX,
} from './logging.service';

describe('LoggingService', () => {
  const testMessage = 'TEST_MSG';
  let service: LoggingService;

  beforeEach(() => {
    service = new LoggingService();
  });

  it('can log info', () => {
    spyOn(window.console, 'log');

    service.log(testMessage);

    expect(window.console.log).toHaveBeenCalledWith(LOG_PREFIX, testMessage);
  });

  it('can log warning', () => {
    spyOn(window.console, 'warn');

    service.logWarn(testMessage);

    expect(window.console.warn).toHaveBeenCalledWith(WARN_PREFIX, testMessage);
  });

  it('can log error', () => {
    spyOn(window.console, 'error');

    service.logError(testMessage);

    expect(window.console.error)
        .toHaveBeenCalledWith(ERROR_PREFIX, testMessage);
  });
});

import { MatDialog } from '@angular/material/dialog';
// import { LoginApi } from '../api/login-api.service';
import { ResponseStatusHandlerService,
} from './response-status-handler.service';

describe('ResponseStatusHandlerService', () => {
  let service: ResponseStatusHandlerService;

  beforeEach(() => {
    // const fakeLoginApi = {} as LoginApi;
    const fakeMatDialog = {} as MatDialog;
    // service = new ResponseStatusHandlerService(fakeMatDialog, fakeLoginApi);
    service = new ResponseStatusHandlerService(fakeMatDialog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

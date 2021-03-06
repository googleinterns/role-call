import {MatDialog} from '@angular/material/dialog';

import {LoginApi} from '../api/login_api.service';

import {ResponseStatusHandlerService} from './response-status-handler.service';

describe('ResponseStatusHandlerService', () => {
  let service: ResponseStatusHandlerService;

  beforeEach(() => {
    const fakeLoginApi = {} as LoginApi;
    const fakeMatDialog = {} as MatDialog;
    service = new ResponseStatusHandlerService(fakeMatDialog, fakeLoginApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

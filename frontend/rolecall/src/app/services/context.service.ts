import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ContextService {
  public checkUnavs = false;
  public checUnavDate = 0;
}

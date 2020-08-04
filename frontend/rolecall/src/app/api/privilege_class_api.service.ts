import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeClassApi {

  constructor() { }

  /** Emitter that is called whenever privilege classes are loaded */
  privilegeClassEmitter: EventEmitter<string[]> = new EventEmitter();

  public getAllPrivilegeClasses(): Promise<string[]> {
    return Promise.resolve([
      "admin",
      "choreographer"
    ]).then(val => {
      this.privilegeClassEmitter.emit(val);
      return val;
    });
  }


}

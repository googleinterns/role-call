import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeClassApi {

  constructor() { }

  /** Emitter that is called whenever privilege classes are loaded */
  privilegeClassEmitter: EventEmitter<string[]> = new EventEmitter();

  /** Placeholder API promise for users
   * This will eventually contain a full API for defining
   * different pre-defined privilege levels a user can have,
   * as well as what permissions are associated with them
   * by default. Ex: an artistic director would need to be able
   * to manage performances and casts, no matter what the exact permissions
   * set is.
   */
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

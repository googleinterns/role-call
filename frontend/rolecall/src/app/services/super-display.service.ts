import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class DisplayService {
  superIsOpenMap = new Map<string, boolean>();

  delete(uuid: string) {
    if (this.superIsOpenMap.has(uuid)) {    
      this.superIsOpenMap.delete(uuid);
    }    
  }

  isOpen(uuid: string): boolean {
    if (!this.superIsOpenMap.has(uuid)) {    
      return false;
    }
    return this.superIsOpenMap.get(uuid);
  }

  update(uuid: string, isOpen: boolean) {
    this.superIsOpenMap.set(uuid, isOpen);
  }

  verifyLoad(uuid: string, isOpen: boolean) {
    if (!this.superIsOpenMap.has(uuid)) {
      this.superIsOpenMap.set(uuid, isOpen);
    }
  }
}

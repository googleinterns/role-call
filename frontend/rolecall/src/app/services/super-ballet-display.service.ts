import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class SuperBalletDisplayService {
  superBalletIsOpenMap = new Map<string, boolean>();

  changeOpenState(uuid: string, isOpen: boolean) {
    this.superBalletIsOpenMap.set(uuid, isOpen);
  }

  isOpen(uuid: string): boolean {
    return Boolean(this.superBalletIsOpenMap.get(uuid));
  }

  removeFromDisplayList(uuid: string) {
    if (this.superBalletIsOpenMap.has(uuid)) {    
      this.superBalletIsOpenMap.delete(uuid);
    }    
  }

  verifyIsInDisplayList(uuid: string, isOpen: boolean) {
    if (!this.superBalletIsOpenMap.has(uuid)) {
      this.superBalletIsOpenMap.set(uuid, isOpen);
    }
  }
}

import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class SuperBalletDisplayService {
  superBalletIsOpenMap = new Map<string, boolean>();

  isInDisplayList(balletId: string) {
    return this.superBalletIsOpenMap.has(balletId);
  }

  isOpen(balletId: string): boolean {
    return Boolean(this.superBalletIsOpenMap.get(balletId));
  }

  removeFromDisplayList(balletId: string) {
    return this.superBalletIsOpenMap.delete(balletId);
  }

  setOpenState(balletId: string, isOpen: boolean) {
    this.superBalletIsOpenMap.set(balletId, isOpen);
  }
}

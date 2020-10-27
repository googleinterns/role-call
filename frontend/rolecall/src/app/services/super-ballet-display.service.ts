import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class SuperBalletDisplayService {
  private readonly superBalletIsOpenMap = new Map<string, boolean>();

  isInDisplayList(balletId: string): boolean {
    return this.superBalletIsOpenMap.has(balletId);
  }

  isOpen(balletId: string): boolean {
    return Boolean(this.superBalletIsOpenMap.get(balletId));
  }

  removeFromDisplayList(balletId: string) {
    this.superBalletIsOpenMap.delete(balletId);
  }

  setOpenState(balletId: string, isOpen: boolean) {
    this.superBalletIsOpenMap.set(balletId, isOpen);
  }
}

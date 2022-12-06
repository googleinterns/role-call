import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SuperBalletDisplayService {
  private readonly superBalletIsOpenMap = new Map<string, boolean>();

  isInDisplayList = (balletId: string): boolean =>
    this.superBalletIsOpenMap.has(balletId);


  isOpen = (balletId: string): boolean =>
    Boolean(this.superBalletIsOpenMap.get(balletId));


  removeFromDisplayList = (balletId: string): void => {
    this.superBalletIsOpenMap.delete(balletId);
  };

  setOpenState = (balletId: string, isOpen: boolean): void => {
    this.superBalletIsOpenMap.set(balletId, isOpen);
  };
}

/* eslint-disable @typescript-eslint/member-ordering */

import { EventEmitter } from '@angular/core';
import { SuccessIndicator } from 'src/api-types';
import { MockBackend } from '../mocks/mock-backend';
import { CrudApi } from '../api/crud-api.service';
import { HttpParams } from '@angular/common/http';

export enum CacheTp {
  undef,
  loadOnly,
  readOnlu,
  readWrite,
}

export type FromRaw = undefined |
  ( (rawItem: unknown, data: unknown) => unknown );
export type FromRawInit = undefined | ( () => unknown );
export type ToRaw = undefined | ( (item: unknown, exists: boolean) => unknown );

export enum CacheRetCd {
  ok,
  error,
}

export type ItemStdReturn = {
  data: unknown;
  warnings: string[];
};

export type CacheLoadReturn = {
  items: unknown[];
  warnings: string[];
};

export type CacheGetReturn = {
  ok: SuccessIndicator;
  item: unknown[];
  warnings: string[];
};

export type CacheSetReturn = {
  ok: SuccessIndicator;
  rawItem: unknown;
  warnings: string[];
};

export type CacheDeleteReturn = {
  ok: SuccessIndicator;
  warnings: string[];
};

export type CacheSortCmp = undefined | ((a: unknown, b: unknown) =>  number);

export class DataCache<IXT> {

  /** DataCache type. */
  tp: CacheTp = CacheTp.readWrite;
  /** Map holding the data in memory. IXT is type of the uuid index. */
  map: Map<IXT, unknown> = new Map<IXT, unknown>();
  /** Array of same data as in map above. */
  arr: unknown[] = [];

  /** Event emitter for load all events. */
  loadedAll: EventEmitter<unknown[]> = new EventEmitter();
  /** Event emitter for incrementa load events. */
  loadedOne: EventEmitter<unknown> = new EventEmitter();

  /** Flag that marks when first loadAll has happened. */
  isLoaded = false;

  /** Optional overide functions to customize processing. */
  public loadAllRequestOverride: (cache: DataCache<IXT>) =>
      Promise<CacheLoadReturn>;
  public getRequestOverride: (cache: DataCache<IXT>, ix: IXT) =>
      Promise<CacheGetReturn>;
  public setRequestOverride: (cache: DataCache<IXT>, item: unknown) =>
      Promise<CacheSetReturn>;
  public deleteRequestOverride: (cache: DataCache<IXT>, item: unknown) =>
      Promise<CacheDeleteReturn>;

  /** The name of the record managed by the cache. */
  public name: string;
  /** The backend name of the API for the CRUD functions. */
  public apiName: string;
  /** The name of the index database field. Used by delete. */
  public ixName: string;
  /** The CRUD 'library'. */
  public crudApi: CrudApi<IXT>;
  /** Returns the uuid from the unknown item. */
  public getIx: (item: unknown) => IXT;
  /** Converts from a raw record into a client workspace record. */
  public fromRaw?: FromRaw;
  /** Initializes the conversion from a raw record */
  public fromRawInit?: FromRawInit;
  /** Converts from a client workspace record into a raw record. */
  public toRaw?: ToRaw;
  /** Sort comparison method. If missing no sort is executed. */
  public sortCmp?: CacheSortCmp;
  /** The associated mockBackend used for testing. */
  public mockBackend?: MockBackend<IXT>;
  /** Method returning a nonstandard url for the loadAll method. */
  public loadAllUrl?: () => string;
  /** Method returning a nonstandard parameters for the loadAll method. */
  public loadAllParams?: () => HttpParams;
  public loadAllEmitItems?: () => unknown[];
  /**
   * Cleaning up or transforming an existing record before PATCHing.
   * For example, marking child records for deletion.
   */
  public preUpdateCleanup?: (rawItem: unknown) => unknown;

  constructor({
    name,
    apiName,
    ixName,
    crudApi,
    getIx,
    // Optional below
    fromRaw,
    fromRawInit,
    toRaw,
    sortCmp,
    mockBackend,
    loadAllUrl,
    loadAllParams,
    loadAllEmitItems,
    preUpdateCleanup
  }: {
    name: string;
    apiName: string;
    ixName: string;
    crudApi: CrudApi<IXT>;
    getIx: (item: unknown) => IXT;
    fromRaw?: FromRaw;
    fromRawInit?: FromRawInit;
    toRaw?: ToRaw;
    sortCmp?: CacheSortCmp;
    mockBackend?: undefined | MockBackend<IXT>;
    loadAllUrl?: undefined | ( () => string );
    loadAllParams?: undefined | ( () => HttpParams );
    loadAllEmitItems?: undefined | ( () => unknown[] );
    preUpdateCleanup?: undefined | ( (rawItem: unknown) => unknown );
  }) {
    this.name = name;
    this.apiName = apiName;
    this.ixName = ixName;
    this.crudApi = crudApi;
    this.getIx = getIx;
    if (fromRaw) { this.fromRaw = fromRaw; }
    if (fromRawInit) { this.fromRawInit = fromRawInit; }
    if (toRaw) { this.toRaw = toRaw; }
    if (sortCmp) { this.sortCmp = sortCmp; }
    if (mockBackend) { this.mockBackend = mockBackend; }
    if (loadAllUrl) { this.loadAllUrl = loadAllUrl; }
    if (loadAllParams) { this.loadAllParams = loadAllParams; }
    if (loadAllEmitItems) { this.loadAllEmitItems = loadAllEmitItems; }
    if (preUpdateCleanup) { this.preUpdateCleanup = preUpdateCleanup; }

    if (mockBackend) { this.mockBackend.cache = this; }
  }

  refreshData = (): unknown[] => {
    const items = this.loadAllEmitItems
      ? this.loadAllEmitItems()
      : Array.from(this.arr.values());
    this.loadedAll.emit(items);
    return items;
  };

  loadAll = async (
  ): Promise<unknown[]> => {
    this.isLoaded = false;
    this.map.clear();
    let lret: CacheLoadReturn;
    try {
      if (this.loadAllRequestOverride) {
        lret = await this.loadAllRequestOverride(this);
      } else {
        lret = await this.crudApi.stdLoadAllItems(this);
      }
    } catch (_e) {
      return [];
    }
    if (lret.warnings) {
      for (const warning of lret.warnings) {
        this.crudApi.loggingService.logWarn(warning);
      }
    }
    let items = lret.items;
    if (this.sortCmp) {
      items = items.sort(this.sortCmp);
    }
    this.arr = items;
    for (const item of items) {
      this.map.set(this.getIx(item), item);
    }
    this.isLoaded = true;
    if (this.loadAllEmitItems) {
      items = this.loadAllEmitItems();
    }
    this.loadedAll.emit(Array.from(items));
    return items;
  };

  get = async (
    ix: IXT,
  ): Promise<unknown> => {
    const current = this.map.get(ix);
    if (current) {
      return current;
    }
    let gret: CacheGetReturn;
    if (this.getRequestOverride) {
      gret = await this.getRequestOverride(this, ix);
    } else {
      gret = await this.crudApi.stdGetItem(this, ix);
    }
    if (gret.warnings) {
      for (const warning of gret.warnings) {
        this.crudApi.loggingService.logWarn(warning);
      }
    }
    const item = gret.item;
    this.arr.push(item);
    if (this.sortCmp) {
      this.arr = this.arr.sort(this.sortCmp);
    }
    this.loadedOne.emit(item);
    return item;
  };

  set = async (
    item: unknown,
  ): Promise<SuccessIndicator> => {
    const ix = this.getIx(item);
    let sret: CacheSetReturn;
    if (this.setRequestOverride) {
      sret = await this.setRequestOverride(this, item);
    } else {
      sret = await this.crudApi.stdSetItem(this, item);
    }
    if (sret.warnings) {
      for (const warning of sret.warnings) {
        this.crudApi.loggingService.logWarn(warning);
      }
    }
    if (sret.ok.successful) {
      let savedItem: unknown;
      if (this.fromRaw) {
        const data = this.fromRawInit ? this.fromRawInit() : undefined;
        savedItem = this.fromRaw(sret.rawItem, data);
      } else {
        savedItem = sret.rawItem;
      }
      if (this.map.has(ix)) {
        // Replace with delete&set for change detection
        // Object.assign(current, item);
        this.map.delete(ix);
        this.map.set(this.getIx(savedItem), savedItem);
        this.arr = Array.from(this.map.values());
        if (this.sortCmp) {
          this.arr = this.arr.sort(this.sortCmp);
        }
      } else {
        this.map.set(this.getIx(savedItem), savedItem);
        this.arr.push(savedItem);
        if (this.sortCmp) {
          this.arr = this.arr.sort(this.sortCmp);
        }
      }
      sret.ok.item = savedItem;
    }
    return sret.ok;
  };

  delete = async (
    item: unknown,
  ): Promise<CacheRetCd> => {
    const ix = this.getIx(item);
    if (this.map.has(ix)) {
      this.map.delete(ix);
      const pos = this.arr.findIndex(itm => ix === this.getIx(itm));
      this.arr.splice(pos, 1);
    }
    let dret: CacheDeleteReturn;
    if (this.deleteRequestOverride) {
      dret = await this.deleteRequestOverride(this, item);
    } else {
      dret = await this.crudApi.stdDeleteItem(this, item);
    }
    for (const warning of dret.warnings) {
      this.crudApi.loggingService.logWarn(warning);
    }
    return CacheRetCd.ok;
  };  // static helper functions

  static itemSetReturnOk = (
    resp: ItemStdReturn,
  ): CacheSetReturn => ({
      ok: {
        successful: true,
      },
      rawItem: resp.data,
      warnings: resp.warnings,
    } as CacheSetReturn);


  static itemSetReturnError = (
    reason: any,
  ): CacheSetReturn => ({
      ok: {
        successful: false,
        error: reason,
      },
      rawItem: null,
      warnings: [],
    } as CacheSetReturn);


  static itemDeleteReturnOk = (
    _resp: ItemStdReturn,
  ): CacheDeleteReturn => ({
      ok: {
        successful: true,
      },
      warnings: [],
    } as CacheDeleteReturn);


  static itemDeleteReturnError = (
    reason: any,
  ): CacheDeleteReturn => ({
      ok: {
        successful: false,
        error: reason,
      },
      warnings: [],
    } as CacheDeleteReturn);

}

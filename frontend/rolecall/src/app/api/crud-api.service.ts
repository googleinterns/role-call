// /* eslint-disable @typescript-eslint/naming-convention */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { DataCache, CacheLoadReturn, CacheGetReturn, CacheSetReturn,
  CacheDeleteReturn, ItemStdReturn,
} from '../utils/data-cache';
import { LoggingService } from '../services/logging.service';


export type RawAllItemsResponse = {
  data: unknown[];
  warnings: string[];
};

export type RawOneItemResponse = {
  data: unknown;
  warnings: string[];
};

/**
 * A service responsible for interfacing with the User API and
 * keeping track of all users by ID.
 */
@Injectable({providedIn: 'root'})
export class CrudApi<IXT> {

  constructor(
      private http: HttpClient,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService,

      public loggingService: LoggingService,
  ) {
  }

  requestAllItems = async (
    cache: DataCache<IXT>,
  ): Promise<CacheLoadReturn> => {
    const api = cache.apiName;
    const fromRaw = cache.fromRaw;
    const loadAllUrl = cache.loadAllUrl;
    if (environment.mockBackend) {
      return cache.mockBackend.requestAllMocks();
    }
    const reqUrl = loadAllUrl ? loadAllUrl() : environment.backendURL + api;
    const headers = await this.headerUtil.generateHeader();
    const observe = 'response';
    const withCredentials = true;
    let httpParams;
    if (cache.loadAllParams) {
      const params = cache.loadAllParams();
      httpParams = { headers, observe, withCredentials, params, };
    } else {
      httpParams = { headers, observe, withCredentials, };
    }
    return lastValueFrom(this.http.get<RawAllItemsResponse>(
      reqUrl, httpParams,
      ))
      .catch(errorResp => errorResp)
      .then(resp => this.respHandler.checkResponse<RawAllItemsResponse>(resp))
      // .then(rawAllUsersResponse => ({
      //     items: rawAllUsersResponse.data.map(rawItem =>
      //         fromRaw ? fromRaw(rawItem) : rawItem),
      //     warnings: rawAllUsersResponse.warnings
      //   })
      .then(rawAllUsersResponse => {
          const data = {
          items: rawAllUsersResponse.data.map(rawItem =>
              fromRaw ? fromRaw(rawItem) : rawItem),
          warnings: rawAllUsersResponse.warnings
        };
console.log('Loading', data.items);
        return data;
      });
  };

  requestOneItem = async (
    cache: DataCache<IXT>,
    uuid: IXT,
  ): Promise<CacheGetReturn> => {
    const api = cache.apiName;
    const getIx = cache.getIx;
    const fromRaw = cache.fromRaw;
    if (environment.mockBackend) {
      return cache.mockBackend.requestOneMock(uuid, getIx);
    }
    return lastValueFrom(this.http.get<RawOneItemResponse>(
      environment.backendURL + api + uuid, {
          headers: await this.headerUtil.generateHeader(),
          observe: 'response',
          withCredentials: true
        }))
      .catch(errorResp => errorResp)
      .then(resp => this.respHandler.checkResponse<RawOneItemResponse>(resp))
      .then(rawResponse => ({
          ok: { successful: true, },
          item: fromRaw ? fromRaw(rawResponse.data) : rawResponse.data,
          warnings: rawResponse.warnings,
        } as CacheGetReturn)
      );
  };

  /** Hits backend with create/edit user POST request. */
  requestItemSet = async (
    cache: DataCache<IXT>,
    item: unknown,
  ): Promise<ItemStdReturn> => {
    const api = cache.apiName;
    const getIx = cache.getIx;
    const toRaw = cache.toRaw;
    if (environment.mockBackend) {
      return cache.mockBackend.requestMockSet(item, getIx);
    }
    const exists = cache.map.has(cache.getIx(item));
    let raw = toRaw ? toRaw(item, exists) : item;
    if (exists && cache.preUpdateCleanup) {
      raw = cache.preUpdateCleanup(raw);
    }
    const headers = await this.headerUtil.generateHeader();
    const observe: 'body' | 'events' | 'response' = 'response';
    const withCredentials = true;
    const params = { headers, observe, withCredentials, };
    if (exists) {
      // Do patch
      return lastValueFrom(this.http.patch(
          environment.backendURL + api,
          raw,
          params,
        ))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
    } else {
      // Do post
      return lastValueFrom(this.http.post(
          environment.backendURL + api,
          raw,
          params,
        ))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
    }
  };

  /** Hits backend with delete user POST request. */
  requestItemDelete = async (
    cache: DataCache<IXT>,
    item: unknown,
  ): Promise<ItemStdReturn> => {
    const api = `${cache.apiName}?${cache.ixName}=`;
    const getIx = cache.getIx;
    if (environment.mockBackend) {
      return cache.mockBackend.requestMockDelete(item, getIx);
    }
    return lastValueFrom(this.http.delete(
        `${environment.backendURL}${api}${getIx(item)}`, {
              observe: 'response',
              headers: await this.headerUtil.generateHeader(),
              withCredentials: true
            }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<ItemStdReturn>(resp));
  };

  // generic entry points

  /** Loads all the items from the backend. */
  stdLoadAllItems = async (
    cache: DataCache<IXT>,
  ): Promise<CacheLoadReturn> =>
      this.requestAllItems(cache);

  /** Gets a specific item from the backend by UUID. */
  stdGetItem = async (
    cache: DataCache<IXT>,
    uuid: IXT,
  ): Promise<CacheGetReturn> =>
    this.requestOneItem(cache, uuid);

  /** Updates the given item on the backend. */
  stdSetItem = async (
    cache: DataCache<IXT>,
    item: unknown,
  ): Promise<CacheSetReturn> =>
    this.requestItemSet(cache, item)
      .then(r => DataCache.itemSetReturnOk(r))
      .catch(e => DataCache.itemSetReturnError(e));

  /** Deletes the given item from the backend. */
  stdDeleteItem = async (
    cache: DataCache<IXT>,
    item: unknown,
  ): Promise<CacheDeleteReturn> =>
    this.requestItemDelete(cache, item)
      .then(r => DataCache.itemDeleteReturnOk(r))
      .catch(e => DataCache.itemDeleteReturnError(e));

}

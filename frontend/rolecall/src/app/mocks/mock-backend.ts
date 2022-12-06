// /* eslint-disable @typescript-eslint/naming-convention */

import {DataCache, CacheLoadReturn, CacheGetReturn, ItemStdReturn,
  CacheTp,
} from '../utils/data-cache';

/**
 * Mocks the user backend responses
 */
export class MockBackend<IXT> {

  /** Mock database */
  public mockDb: unknown[] = [];

  public cache: DataCache<IXT>;

  constructor(
  ) {
  }

  /** Mocks backend loadAll response */
  requestAllMocks = async (): Promise<CacheLoadReturn> =>
    Promise.resolve({
      items: this.mockDb,
      warnings: []
    });


  /** Mocks backend getOne response */
  requestOneMock = async (
    ix: unknown,
    getIx: (item: unknown) => IXT,
  ): Promise<CacheGetReturn> =>
    Promise.resolve({
      ok: { successful: true },
      item: this.mockDb.find(item => getIx(item) === ix),
      warnings: [],
    } as CacheGetReturn);

  /** Mocks backed set response */
  requestMockSet = (
    item: unknown,
    getIx: (item: unknown) => IXT,
  ): Promise<ItemStdReturn> => {
    if (this.cache.tp !== CacheTp.readWrite) {
      const msg = 'Not Implemented';
      console.log(msg);
      return Promise.resolve({
        data: null,
        warnings: [],
      });
    }
    const uid = getIx(item);
    const pos = this.mockDb.findIndex(itm => getIx(itm) === uid);
    if (pos === -1) {
      this.mockDb.push(item);
    } else {
      this.mockDb[pos] = item;
    }
    return Promise.resolve({
      data: item,
      warnings: [],
    });
  };

  /** Mocks backend delete response */
  requestMockDelete = (
    item: unknown,
    getIx: (item: unknown) => IXT,
  ): Promise<ItemStdReturn> => {
    if (this.cache.tp !== CacheTp.readWrite) {
      const msg = 'Not Implemented';
      console.log(msg);
      return Promise.resolve({
        data: null,
        warnings: [],
      });
    }
    const uid = getIx(item);
    this.mockDb = this.mockDb.filter(itm => getIx(itm) !== uid);
    return Promise.resolve({
      data: item,
      warnings: [],
    });
  };

}

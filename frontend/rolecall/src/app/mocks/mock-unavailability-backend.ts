
import { MockBackend } from './mock-backend';
import { Unavailability } from '../api/unavailability-api.service';
// import { CacheLoadReturn, CacheGetReturn, ItemStdReturn,
// } from '../utils/data-cache';

/** Mocks the unavailability backend responses. */
export class MockUnavailabilityBackend<IXT> extends MockBackend<IXT> {

  constructor(
  ) {
    super();
    this.mockDb = [
      {
        id: 1,
        userId: 206,
        reason: 'INJURY',
        description: 'example desc',
        startDate: 1,
        endDate: 999999,
      },
    ] as Unavailability[];
  }

  // /** Mocks backend response */
  // override requestAllMocks = async (
  // ): Promise<CacheLoadReturn> =>
  //   Promise.resolve({
  //     items: this.mockDb,
  //     warnings: []
  //   });

  // /** Mocks backend response */
  // override requestOneMock = async (
  //   ix: unknown,
  //   getIx: (item: unknown) => IXT,
  // ): Promise<CacheGetReturn> => {
  //   const uuid = ix as IXT;
  //   return Promise.resolve({
  //     ok: { successful: true },
  //     item: this.mockDb.find(itm => getIx( itm ) === uuid),
  //     warnings: [],
  //   } as CacheGetReturn);
  // };

  // override requestMockSet = (
  //   item: unknown,
  //   _getIx: (item: unknown) => IXT,
  // ): Promise<ItemStdReturn> => {
  //   const unavail = item as Unavailability;
  //   const pos =
  //     this.mockDb.findIndex(val =>
  //       ( val as Unavailability ).id === unavail.id);
  //   if (pos === -1) {
  //     this.mockDb.push(unavail);
  //   } else {
  //     this.mockDb[pos] = unavail;
  //   }
  //   return Promise.resolve({
  //     data: unavail,
  //     warnings: [],
  //   });
  // };

  // /** Mocks user delete response */
  // override requestMockDelete = (
  //   item: unknown,
  //   _getIx: (item: unknown) => IXT,
  // ): Promise<ItemStdReturn> => {
  //   const unavail = item as Unavailability;
  //   this.mockDb =
  //     this.mockDb.filter(itm => ( itm as Unavailability ).id !== unavail.id);
  //   return Promise.resolve({
  //     data: unavail,
  //     warnings: [],
  //   });
  // };

}

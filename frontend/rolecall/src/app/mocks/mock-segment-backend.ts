import { MockBackend } from './mock-backend';
import { Segment } from '../api/segment-api.service';
// import { CacheLoadReturn, CacheGetReturn, ItemStdReturn,
// } from '../utils/data-cache';

/** Mocks the unavailability backend responses. */
export class MockSegmentBackend<IXT> extends MockBackend<IXT> {

  // shouldRejectSetRequest = false;

  constructor(
  ) {
    super();
    this.mockDb = [{
        uuid: '212',
        name: 'Ode',
        siblingId: null,
        isOpen: false,
        type: 'SEGMENT',
        positions: [{
            id: 213,
            name: 'Dancer',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '213'
          }],
        deletePositions: []
      }, {
        uuid: '214',
        name: 'Divining',
        siblingId: null,
        isOpen: false,
        type: 'SEGMENT',
        positions: [{
            id: 216,
            name: 'Resting and Moving On',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '216'
          }, {
            id: 215,
            name: 'Seeking, Resting, and Moving On',
            notes: '',
            order: 1,
            siblingId: null,
            size: null,
            uuid: '215'
          }, {
            id: 217,
            name: 'Moving On',
            notes: '',
            order: 2,
            siblingId: null,
            size: null,
            uuid: '217'
          }],
        deletePositions: []
      }, {
        uuid: '220',
        name: 'Greenwood',
        siblingId: null,
        isOpen: false,
        type: 'SEGMENT',
        positions: [{
            id: 221,
            name: 'Witness',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '221'
          }, {
            id: 222,
            name: 'Sara Page',
            notes: '',
            order: 1,
            siblingId: null,
            size: null,
            uuid: '222'
          }, {
            id: 223,
            name: 'Dick Rowland',
            notes: '',
            order: 2,
            siblingId: null,
            size: null,
            uuid: '223'
          }, {
            id: 226,
            name: 'Son',
            notes: '',
            order: 3,
            siblingId: null,
            size: null,
            uuid: '226'
          }, {
            id: 227,
            name: 'Daughter',
            notes: '',
            order: 4,
            siblingId: null,
            size: null,
            uuid: '227'
          }, {
            id: 225,
            name: 'Mother',
            notes: '',
            order: 5,
            siblingId: null,
            size: null,
            uuid: '225'
          }, {
            id: 224,
            name: 'Father',
            notes: '',
            order: 6,
            siblingId: null,
            size: null,
            uuid: '224'
          }, {
            id: 228,
            name: 'White Psyche',
            notes: '',
            order: 7,
            siblingId: null,
            size: null,
            uuid: '228'
          }],
        deletePositions: []
      }, {
        uuid: '247',
        name: 'Fandango',
        siblingId: null,
        isOpen: false,
        type: 'SEGMENT',
        positions: [{
            id: 248,
            name: 'Dancer - Fandango',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '248'
          }],
        deletePositions: []
      }, {
        uuid: '358',
        siblingId: null,
        isOpen: false,
        type: 'SEGMENT',
        name: 'Ella',
        positions: [{
            id: 359,
            name: 'Dancer - Ella',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '359'
          }],
        deletePositions: []
      }] as Segment[];
  }

  // /** Mocks backend response */
  // override requestAllMocks = async (
  //   ): Promise<CacheLoadReturn> =>
  //     Promise.resolve({
  //       items: this.mockDb,
  //       warnings: []
  //     });

  // /** Mocks backend response */
  // override requestOneMock = async (
  //   ix: unknown,
  //   getIx: (item: unknown) => IXT,
  // ): Promise<CacheGetReturn> => {
  //   const uuid = ix as IXT;
  //   return Promise.resolve({
  //     ok: { successful: true },
  //     item: this.mockDb.find(itm => getIx(itm) === uuid),
  //     warnings: [],
  //   } as CacheGetReturn);
  // };

  // override requestMockSet = (
  //   item: unknown,
  //   _getIx: (item: unknown) => IXT,
  // ): Promise<ItemStdReturn> => {
  //   const segment = item as Segment;
  //   const pos =
  //     this.mockDb.findIndex(val => ( val as Segment ).uuid === segment.uuid);
  //   if (pos === -1) {
  //     this.mockDb.push(segment);
  //   } else {
  //     this.mockDb[pos] = segment;
  //   }
  //   return Promise.resolve({
  //     data: segment,
  //     warnings: [],
  //   });
  // };

  // /** Mocks user delete response */
  // override requestMockDelete = (
  //   item: unknown,
  //   _getIx: (item: unknown) => IXT,
  // ): Promise<ItemStdReturn> => {
  //   const segment = item as Segment;
  //   this.mockDb =
  //     this.mockDb.filter(itm => ( itm as Segment ).uuid !== segment.uuid);
  //   return Promise.resolve({
  //     data: segment,
  //     warnings: [],
  //   });
  // };

}

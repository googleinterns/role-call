/* eslint-disable @typescript-eslint/naming-convention */

import { MockBackend } from './mock-backend';
import { Cast } from '../api/cast-api.service';
import { CacheLoadReturn, CacheGetReturn, ItemStdReturn,
} from '../utils/data-cache';


/** Mocks the user backend responses */
export class MockCastBackend<IXT> extends MockBackend<IXT> {

  constructor(
  ) {
    super();
    this.mockDb = [{
        uuid: '249',
        name: '2020 Tour Roster',
        segment: '247',
        castCount: 3,
        filled_positions: [{
            position_uuid: '248',
            groups: [{
                position_uuid: '248', group_index: 1, members: [
                  { uuid: '185', position_number: 1, hasAbsence: false },
                  { uuid: '193', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '248', group_index: 0, members: [
                  { uuid: '198', position_number: 1, hasAbsence: false },
                  { uuid: '191', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false,
          }
        ]
      },
      {
        uuid: '360',
        name: '2020 Tour Roster',
        segment: '358',
        castCount: 3,
        filled_positions: [
          {
            position_uuid: '359', groups: [
              {
                position_uuid: '359', group_index: 0, members: [
                  { uuid: '193', position_number: 1, hasAbsence: false },
                  { uuid: '194', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '359', group_index: 1, members: [
                  { uuid: '189', position_number: 0, hasAbsence: false },
                  { uuid: '191', position_number: 1, hasAbsence: false }
                ]
              },
              {
                position_uuid: '359', group_index: 2, members: [
                  { uuid: '187', position_number: 1, hasAbsence: false },
                  { uuid: '184', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '359', group_index: 3, members: [
                  { uuid: '200', position_number: 0, hasAbsence: false },
                  { uuid: '209', position_number: 1, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          }
        ]
      },
      {
        uuid: '373',
        name: '2020 Tour Roster',
        segment: '220',
        castCount: 3,
        filled_positions: [
          {
            position_uuid: '227', groups: [
              {
                position_uuid: '227', group_index: 0, members: [
                  { uuid: '193', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '227', group_index: 1, members: [
                  { uuid: '203', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '223', groups: [
              {
                position_uuid: '223', group_index: 0, members: [
                  { uuid: '197', position_number: 0, hasAbsence: false }
                ]
              }, {
                position_uuid: '223', group_index: 1, members: [
                  { uuid: '184', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '224', groups: [
              {
                position_uuid: '224', group_index: 0, members: [
                  { uuid: '198', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '224', group_index: 1, members: [
                  { uuid: '199', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '225', groups: [
              {
                position_uuid: '225', group_index: 0, members: [
                  { uuid: '189', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '225', group_index: 1, members: [
                  { uuid: '202', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '222', groups: [
              {
                position_uuid: '222', group_index: 0, members: [
                  { uuid: '191', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '222', group_index: 1, members: [
                  { uuid: '192', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '226', groups: [
              {
                position_uuid: '226', group_index: 0, members: [
                  { uuid: '188', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '226', group_index: 1, members: [
                  { uuid: '187', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '228', groups: [
              {
                position_uuid: '228', group_index: 0, members: [
                  { uuid: '195', position_number: 6, hasAbsence: false },
                  { uuid: '194', position_number: 4, hasAbsence: false },
                  { uuid: '200', position_number: 5, hasAbsence: false },
                  { uuid: '186', position_number: 2, hasAbsence: false },
                  { uuid: '185', position_number: 0, hasAbsence: false },
                  { uuid: '183', position_number: 1, hasAbsence: false },
                  { uuid: '199', position_number: 3, hasAbsence: false }
                ]
              },
              {
                position_uuid: '228', group_index: 1, members: [
                  { uuid: '204', position_number: 0, hasAbsence: false },
                  { uuid: '209', position_number: 6, hasAbsence: false },
                  { uuid: '196', position_number: 1, hasAbsence: false },
                  { uuid: '205', position_number: 2, hasAbsence: false },
                  { uuid: '208', position_number: 5, hasAbsence: false },
                  { uuid: '207', position_number: 4, hasAbsence: false },
                  { uuid: '206', position_number: 3, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          },
          {
            position_uuid: '221', groups: [
              {
                position_uuid: '221', group_index: 0, members: [
                  { uuid: '190', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '221', group_index: 1, members: [
                  { uuid: '201', position_number: 0, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          }
        ]
      },
      {
        uuid: '476',
        name: '2020 Tour Roster',
        segment: '212',
        castCount: 3,
        filled_positions: [
          {
            position_uuid: '213', groups: [
              {
                position_uuid: '213', group_index: 0, members: [
                  { uuid: '184', position_number: 1, hasAbsence: false },
                  { uuid: '186', position_number: 3, hasAbsence: false },
                  { uuid: '183', position_number: 0, hasAbsence: false },
                  { uuid: '188', position_number: 5, hasAbsence: false },
                  { uuid: '185', position_number: 2, hasAbsence: false },
                  { uuid: '187', position_number: 4, hasAbsence: false }
                ]
              },
              {
                position_uuid: '213', group_index: 2, members: [
                  { uuid: '196', position_number: 2, hasAbsence: false },
                  { uuid: '195', position_number: 0, hasAbsence: false }
                ]
              },
              {
                position_uuid: '213', group_index: 1, members: [
                  { uuid: '193', position_number: 4, hasAbsence: false },
                  { uuid: '189', position_number: 0, hasAbsence: false },
                  { uuid: '194', position_number: 5, hasAbsence: false },
                  { uuid: '190', position_number: 1, hasAbsence: false },
                  { uuid: '192', position_number: 3, hasAbsence: false },
                  { uuid: '191', position_number: 2, hasAbsence: false }
                ]
              }
            ],
            hasAbsence: false
          }
        ]
      }
    ];
  }

  /** Mocks backend response */
  override requestAllMocks = async (
    ): Promise<CacheLoadReturn> =>
      Promise.resolve({
        items: this.mockDb,
        warnings: []
      });

  /** Mocks backend response */
  override requestOneMock = async (
    ix: unknown,
    getIx: (item: unknown) => IXT,
  ): Promise<CacheGetReturn> => {
    const uuid = ix as IXT;
    return Promise.resolve({
      ok: { successful: true },
      item: this.mockDb.find(itm => getIx(itm) === uuid),
      warnings: [],
    } as CacheGetReturn);
  };


  override requestMockSet = (
    item: unknown,
    _getIx: (item: unknown) => IXT,
  ): Promise<ItemStdReturn> => {
    const cast = item as Cast;
    const itemPos =
      this.mockDb.findIndex(val => ( val as Cast ).uuid === cast.uuid);
    if (itemPos === -1) {
      this.mockDb.push(cast);
    } else {
      this.mockDb[itemPos] = cast;
    }
    return Promise.resolve({
      data: cast,
      warnings: [],
    });
  };

  /** Mocks user delete response */
  override requestMockDelete = (
    item: unknown,
    _getIx: (item: unknown) => IXT,
  ): Promise<ItemStdReturn> => {
    const cast = item as Cast;
    this.mockDb =
      this.mockDb.filter(itm => ( itm as Cast ).uuid !== cast.uuid);
    return Promise.resolve({
      data: cast,
      warnings: [],
    });
  };

}

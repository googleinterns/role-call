import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/types';
import { AllCastsResponse, Cast, OneCastResponse } from '../api/cast_api.service';

/**
 * Mocks the cast backend responses
 */
export class MockCastBackend {

  /** Mock cast database */
  mockCastDB: Cast[] = [
    {
      uuid: "CAST1UUID",
      name: "Cast 1",
      segment: "PIECE1UUID",
      filled_positions: [{
        position_uuid: "piece1pos1",
        groups: [
          {
            group_index: 0,
            members: [{
              uuid: "USERUUID1",
              position_number: 0
            },
            {
              uuid: "USERUUID2",
              position_number: 1
            },
            {
              uuid: "USERUUID2",
              position_number: 2
            }]
          },
          {
            group_index: 1,
            members: [{
              uuid: "USERUUID2",
              position_number: 0
            }, {
              uuid: "USERUUID1",
              position_number: 2
            }]
          },
          {
            group_index: 2,
            members: [{
              uuid: "USERUUID1",
              position_number: 2
            }]
          }
        ],
      },
      {
        position_uuid: "piece1pos2",
        groups: [
          {
            group_index: 0,
            members: [{
              uuid: "USERUUID1",
              position_number: 0
            },
            {
              uuid: "USERUUID2",
              position_number: 1
            },
            {
              uuid: "USERUUID2",
              position_number: 2
            }]
          },
          {
            group_index: 1,
            members: [{
              uuid: "USERUUID2",
              position_number: 0
            }, {
              uuid: "USERUUID1",
              position_number: 2
            }]
          },
          {
            group_index: 2,
            members: [{
              uuid: "USERUUID1",
              position_number: 2
            }]
          }
        ],
      }]
    },
    {
      uuid: "CAST2UUID",
      name: "Cast 2",
      segment: "PIECE2UUID",
      filled_positions: [{
        position_uuid: "piece2pos1",
        groups: [
          {
            group_index: 0,
            members: [{
              uuid: "USERUUID1",
              position_number: 0
            },
            {
              uuid: "USERUUID2",
              position_number: 1
            },
            {
              uuid: "USERUUID2",
              position_number: 2
            }]
          },
          {
            group_index: 1,
            members: [{
              uuid: "USERUUID2",
              position_number: 0
            }, {
              uuid: "USERUUID1",
              position_number: 2
            }]
          },
          {
            group_index: 2,
            members: [{
              uuid: "USERUUID1",
              position_number: 2
            }]
          }
        ],
      },
      {
        position_uuid: "piece2pos2",
        groups: [
          {
            group_index: 0,
            members: [{
              uuid: "USERUUID1",
              position_number: 0
            },
            {
              uuid: "USERUUID2",
              position_number: 1
            },
            {
              uuid: "USERUUID2",
              position_number: 2
            }]
          },
          {
            group_index: 1,
            members: [{
              uuid: "USERUUID2",
              position_number: 0
            }, {
              uuid: "USERUUID1",
              position_number: 2
            }]
          },
          {
            group_index: 2,
            members: [{
              uuid: "USERUUID1",
              position_number: 2
            }]
          }
        ],
      },
      {
        position_uuid: "piece2pos3",
        groups: [
          {
            group_index: 0,
            members: [{
              uuid: "USERUUID1",
              position_number: 0
            },
            {
              uuid: "USERUUID2",
              position_number: 1
            },
            {
              uuid: "USERUUID2",
              position_number: 2
            }]
          },
          {
            group_index: 1,
            members: [{
              uuid: "USERUUID2",
              position_number: 0
            }, {
              uuid: "USERUUID1",
              position_number: 2
            }]
          },
          {
            group_index: 2,
            members: [{
              uuid: "USERUUID1",
              position_number: 2
            }]
          }
        ],
      }]
    }
  ];
  shouldRejectSetRequest = false;

  /** Mocks backend response */
  requestAllCasts(): Promise<AllCastsResponse> {
    return Promise.resolve({
      data: {
        casts: this.mockCastDB
      },
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOneCast(uuid: APITypes.CastUUID): Promise<OneCastResponse> {
    return Promise.resolve({
      data: {
        cast: this.mockCastDB.find(val => { return val.uuid == uuid || val.uuid === uuid })
      },
      warnings: []
    });
  };

  /** Mocks cast create/edit response */
  requestCastSet(cast: Cast): Promise<HttpResponse<any>> {
    if (!this.shouldRejectSetRequest) {
      let castInd = this.mockCastDB.findIndex((val) => val.uuid == cast.uuid);
      if (castInd == -1) {
        this.mockCastDB.push(cast);
      } else {
        this.mockCastDB[castInd] = cast;
      }
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    }
  }

  /** Mocks cast delete response */
  requestCastDelete(cast: Cast): Promise<HttpResponse<any>> {
    this.mockCastDB = this.mockCastDB.filter(val => val.uuid != cast.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

}
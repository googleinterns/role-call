import {HttpResponse} from '@angular/common/http';
import {AllSegmentsResponse, Segment} from '../api/segment-api.service';

/**
 * Mocks the segment backend responses
 */
export class MockSegmentBackend {

  /** Mock segment database */
  mockSegmentDB: Segment[] = [{
    uuid: '212',
    name: 'Ode',
    siblingId: null,
    isOpen: false,
    type: 'SEGMENT',
    positions:
        [{
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
    positions:
        [{
          id: 216,
          name: 'Resting and Moving On',
          notes: '',
          order: 0,
          siblingId: null,
          size: null,
          uuid: '216'
        },
          {
            id: 215,
            name: 'Seeking, Resting, and Moving On',
            notes: '',
            order: 1,
            siblingId: null,
            size: null,
            uuid: '215'
          },
          {
            id: 217,
            name: 'Moving On',
            notes: '',
            order: 2,
            siblingId: null,
            size: null,
            uuid: '217'
          }],
    deletePositions: []
  },
    {
      uuid: '220',
      name: 'Greenwood',
      siblingId: null,
      isOpen: false,
      type: 'SEGMENT',
      positions:
          [{
            id: 221,
            name: 'Witness',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '221'
          },
            {
              id: 222,
              name: 'Sara Page',
              notes: '',
              order: 1,
              siblingId: null,
              size: null,
              uuid: '222'
            },
            {
              id: 223,
              name: 'Dick Rowland',
              notes: '',
              order: 2,
              siblingId: null,
              size: null,
              uuid: '223'
            },
            {
              id: 226,
              name: 'Son',
              notes: '',
              order: 3,
              siblingId: null,
              size: null,
              uuid: '226'
            },
            {
              id: 227,
              name: 'Daughter',
              notes: '',
              order: 4,
              siblingId: null,
              size: null,
              uuid: '227'
            },
            {
              id: 225,
              name: 'Mother',
              notes: '',
              order: 5,
              siblingId: null,
              size: null,
              uuid: '225'
            },
            {
              id: 224,
              name: 'Father',
              notes: '',
              order: 6,
              siblingId: null,
              size: null,
              uuid: '224'
            },
            {
              id: 228,
              name: 'White Psyche',
              notes: '',
              order: 7,
              siblingId: null,
              size: null,
              uuid: '228'
            }],
      deletePositions: []
    },
    {
      uuid: '247',
      name: 'Fandango',
      siblingId: null,
      isOpen: false,
      type: 'SEGMENT',
      positions:
          [{
            id: 248,
            name: 'Dancer - Fandango',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '248'
          }],
      deletePositions: []
    },
    {
      uuid: '358',
      siblingId: null,
      isOpen: false,
      type: 'SEGMENT',
      name: 'Ella',
      positions:
          [{
            id: 359,
            name: 'Dancer - Ella',
            notes: '',
            order: 0,
            siblingId: null,
            size: null,
            uuid: '359'
          }],
      deletePositions: []
    }];

  shouldRejectSetRequest = false;

  /** Mocks segment backend response */
  requestAllSegments = (): Promise<AllSegmentsResponse> =>
    Promise.resolve({
      data: {
        segments: this.mockSegmentDB
      },
      warnings: []
    });


  /** Mocks segment create/edit response */
  requestSegmentSet = (segment: Segment): Promise<HttpResponse<any>> => {
    if (!this.shouldRejectSetRequest) {
      const segInd = this.mockSegmentDB.findIndex(
          val => val.uuid === segment.uuid);
      if (segInd === -1) {
        this.mockSegmentDB.push(segment);
      } else {
        this.mockSegmentDB[segInd] = segment;
      }
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    }
  };

  /** Mocks segment delete response */
  requestSegmentDelete = (segment: Segment): Promise<HttpResponse<any>> => {
    this.mockSegmentDB = this.mockSegmentDB.filter(val => val.uuid !== segment.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  };

}

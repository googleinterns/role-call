import {HttpResponse} from '@angular/common/http';
import {APITypes} from 'src/api_types';
import {AllPiecesResponse, OnePieceResponse, Piece} from '../api/piece_api.service';

/**
 * Mocks the piece backend responses
 */
export class MockPieceBackend {

  /** Mock piece database */
  mockPieceDB: Piece[] = [{
    'uuid': '212',
    'name': 'Ode',
    'siblingId': null,
    'type': 'SEGMENT',
    'positions':
        [{
          'id': 213,
          'name': 'Dancer',
          'notes': '',
          'order': 0,
          'siblingId': null,
          'size': null,
          'uuid': '213'
        }],
    'deletePositions': []
  }, {
    'uuid': '214',
    'name': 'Divining',
    'siblingId': null,
    'type': 'SEGMENT',
    'positions':
        [{
          'id': 216,
          'name': 'Resting and Moving On',
          'notes': '',
          'order': 0,
          'siblingId': null,
          'size': null,
          'uuid': '216'
        },
          {
            'id': 215,
            'name': 'Seeking, Resting, and Moving On',
            'notes': '',
            'order': 1,
            'siblingId': null,
            'size': null,
            'uuid': '215'
          },
          {
            'id': 217,
            'name': 'Moving On',
            'notes': '',
            'order': 2,
            'siblingId': null,
            'size': null,
            'uuid': '217'
          }],
    'deletePositions': []
  },
    {
      'uuid': '220',
      'name': 'Greenwood',
      'siblingId': null,
      'type': 'SEGMENT',
      'positions':
          [{
            'id': 221,
            'name': 'Witness',
            'notes': '',
            'order': 0,
            'siblingId': null,
            'size': null,
            'uuid': '221'
          },
            {
              'id': 222,
              'name': 'Sara Page',
              'notes': '',
              'order': 1,
              'siblingId': null,
              'size': null,
              'uuid': '222'
            },
            {
              'id': 223,
              'name': 'Dick Rowland',
              'notes': '',
              'order': 2,
              'siblingId': null,
              'size': null,
              'uuid': '223'
            },
            {
              'id': 226,
              'name': 'Son',
              'notes': '',
              'order': 3,
              'siblingId': null,
              'size': null,
              'uuid': '226'
            },
            {
              'id': 227,
              'name': 'Daughter',
              'notes': '',
              'order': 4,
              'siblingId': null,
              'size': null,
              'uuid': '227'
            },
            {
              'id': 225,
              'name': 'Mother',
              'notes': '',
              'order': 5,
              'siblingId': null,
              'size': null,
              'uuid': '225'
            },
            {
              'id': 224,
              'name': 'Father',
              'notes': '',
              'order': 6,
              'siblingId': null,
              'size': null,
              'uuid': '224'
            },
            {
              'id': 228,
              'name': 'White Psyche',
              'notes': '',
              'order': 7,
              'siblingId': null,
              'size': null,
              'uuid': '228'
            }],
      'deletePositions': []
    },
    {
      'uuid': '247',
      'name': 'Fandango',
      'siblingId': null,
      'type': 'SEGMENT',
      'positions':
          [{
            'id': 248,
            'name': 'Dancer - Fandango',
            'notes': '',
            'order': 0,
            'siblingId': null,
            'size': null,
            'uuid': '248'
          }],
      'deletePositions': []
    },
    {
      'uuid': '358',
      'siblingId': null,
      'type': 'SEGMENT',
      'name': 'Ella',
      'positions':
          [{
            'id': 359,
            'name': 'Dancer - Ella',
            'notes': '',
            'order': 0,
            'siblingId': null,
            'size': null,
            'uuid': '359'
          }],
      'deletePositions': []
    }];

  shouldRejectSetRequest = false;

  /** Mocks backend response */
  requestAllPieces(): Promise<AllPiecesResponse> {
    return Promise.resolve({
      data: {
        pieces: this.mockPieceDB
      },
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOnePiece(uuid: APITypes.PieceUUID): Promise<OnePieceResponse> {
    return Promise.resolve({
      data: {
        piece: this.mockPieceDB.find(val => {
          return val.uuid == uuid || val.uuid === uuid;
        })
      },
      warnings: []
    });
  };

  /** Mocks piece create/edit response */
  requestPieceSet(piece: Piece): Promise<HttpResponse<any>> {
    if (!this.shouldRejectSetRequest) {
      const pieceInd = this.mockPieceDB.findIndex(
          (val) => val.uuid == piece.uuid);
      if (pieceInd == -1) {
        this.mockPieceDB.push(piece);
      } else {
        this.mockPieceDB[pieceInd] = piece;
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

  /** Mocks piece delete response */
  requestPieceDelete(piece: Piece): Promise<HttpResponse<any>> {
    this.mockPieceDB = this.mockPieceDB.filter(val => val.uuid != piece.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

}

import {HttpClient, HttpResponse} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import * as APITypes from 'src/api_types';
import {environment} from 'src/environments/environment';

import {MockPieceBackend} from '../mocks/mock_piece_backend';
import {HeaderUtilityService} from '../services/header-utility.service';
import {LoggingService} from '../services/logging.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

type RawPosition = {
  id: number,
  name: string,
  notes: string,
  order: number,
  siblingId: number,
  size: number,
};

type RawPiece = {
  id: number,
  name: string,
  notes: string,
  siblingId: number,
  type: PieceType,
  length: number,
  positions: RawPosition[],
};

type RawAllPiecesResponse = {
  data: RawPiece[],
  warnings: string[],
};

export type Position = {
  id?: number,
  uuid: string,
  name: string,
  notes: string,
  order: number,
  siblingId: number,
  size: number,
};

export type PieceType = 'SEGMENT' | 'BALLET' | 'SUPER';

export type Piece = {
  uuid: string;
  name: string;
  siblingId: number,
  type: PieceType;
  positions: Position[];
  deletePositions: Position[];
};

export type AllPiecesResponse = {
  data: {
    pieces: Piece[]
  },
  warnings: string[]
};

export type OnePieceResponse = {
  data: {
    piece: Piece
  },
  warnings: string[]
};

/**
 * A service responsible for interfacing with the Sections API and
 * maintaining section/piece data.
 */
@Injectable({providedIn: 'root'})
export class PieceApi {
  /** Mock backend. */
  mockBackend: MockPieceBackend = new MockPieceBackend();

  /** All the loaded pieces mapped by UUID. */
  pieces: Map<APITypes.PieceUUID, Piece> = new Map<APITypes.PieceUUID, Piece>();

  /** The raw piece structures given by the backend. */
  rawPieces: RawPiece[] = [];

  /** Emitter that is called whenever pieces are loaded. */
  pieceEmitter: EventEmitter<Piece[]> = new EventEmitter();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private respHandler: ResponseStatusHandlerService,
      private headerUtil: HeaderUtilityService) {
  }

  /** Hits backend with all pieces GET request. */
  async requestAllPieces(): Promise<AllPiecesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllPieces();
    }
    const header = await this.headerUtil.generateHeader();
    return this.http.get<RawAllPiecesResponse>(
        environment.backendURL + 'api/section', {
              headers: header,
              observe: 'response',
              withCredentials: true
            })
        .toPromise()
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<RawAllPiecesResponse>(
            resp)).then(val => {
          this.rawPieces = val.data;
          return {
            data: {
              pieces: val.data.map(section => {
                return {
                  uuid: String(section.id),
                  name: section.name,
                  siblingId: section.siblingId,
                  type: section.type,
                  positions: section.positions.sort(
                      (a, b) => a.order < b.order ? -1 : 1)
                      .map(pos => {
                        return {...pos, uuid: String(pos.id)};
                      }),
                  deletePositions: []
                };
              })
            },
            warnings: val.warnings
          };
        });
  }

  /** Hits backend with create/edit piece POST request. */
  async requestPieceSet(piece: Piece): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPieceSet(piece);
    }
    // If we already have the piece by UUID (i.e. it exists on the backend),
    // then do a PATCH, else do a POST
    if (this.pieces.has(piece.uuid)) {
      // Do patch
      const header = await this.headerUtil.generateHeader();
      return this.http.patch(environment.backendURL + 'api/section', {
            name: piece.name,
            id: Number(piece.uuid),
            siblingId: piece.siblingId,
            type: piece.type ? piece.type : 'BALLET',
            positions: piece.positions.map(val => {
              return {
                ...val,
                delete: false
              };
            }).concat(piece.deletePositions.map(val => {
              return {
                ...val,
                delete: true
              };
            }))
          }, {
            headers: header,
            observe: 'response',
            withCredentials: true
          })
          .toPromise()
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    } else {
      // Do post
      const header = await this.headerUtil.generateHeader();
      return this.http.post(environment.backendURL + 'api/section', {
            name: piece.name,
            siblingId: piece.siblingId,
            type: piece.type ? piece.type : 'BALLET',
            positions: piece.positions
          }, {
            headers: header,
            observe: 'response',
            withCredentials: true
          })
          .toPromise()
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    }
  }

  /** Hits backend with delete piece POST request. */
  async requestPieceDelete(piece: Piece): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPieceDelete(piece);
    }
    const header = await this.headerUtil.generateHeader();
    return this.http.delete(
        environment.backendURL + 'api/section?sectionid=' + piece.uuid, {
              headers: header,
              observe: 'response',
              withCredentials: true
            })
        .toPromise()
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  }

  /** Takes backend response, updates data structures for all pieces. */
  private getAllPiecesResponse(): Promise<AllPiecesResponse> {
    return this.requestAllPieces().then(val => {
      // Update the pieces map
      this.pieces.clear();
      for (const piece of val.data.pieces) {
        this.pieces.set(piece.uuid, piece);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Sends backend request and awaits response. */
  private setPieceResponse(piece: Piece): Promise<HttpResponse<any>> {
    return this.requestPieceSet(piece);
  }

  /** Sends backend request and awaits response. */
  private deletePieceResponse(piece: Piece): Promise<HttpResponse<any>> {
    return this.requestPieceDelete(piece);
  }

  /** Gets all the pieces from the backend and returns them. */
  getAllPieces(): Promise<Piece[]> {
    return this.getAllPiecesResponse().then(val => {
      this.pieceEmitter.emit(Array.from(this.pieces.values()));
      return val;
    }).then(val => val.data.pieces).catch(() => {
      return [];
    });
  }

  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the piece is valid, as well as if the backend
   * request fails for some other reason.
   */
  setPiece(piece: Piece): Promise<APITypes.SuccessIndicator> {
    return this.setPieceResponse(piece).then(() => {
      this.getAllPieces();
      return {
        successful: true
      };
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      };
    });
  }

  /** Requests for the backend to delete the piece. */
  deletePiece(piece: Piece): Promise<APITypes.SuccessIndicator> {
    return this.deletePieceResponse(piece).then(() => {
      this.getAllPieces();
      return {
        successful: true
      };
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      };
    });
  }
}

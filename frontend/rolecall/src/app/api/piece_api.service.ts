import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APITypes } from 'src/types';
import { MockPieceBackend } from '../mocks/mock_piece_backend';
import { LoggingService } from '../services/logging.service';

type RawPosition = {
  id: number,
  name: string,
  notes: string,
  order: number
}

type RawPiece = {
  id: number,
  name: string,
  notes: string,
  length: number,
  positions: RawPosition[]
}

type RawAllPiecesResponse = {
  data: RawPiece[],
  warnings: string[]
}

export type Piece = {
  uuid: string;
  name: string;
  positions: string[];
}

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

@Injectable({
  providedIn: 'root'
})
export class PieceApi {


  /** Mock backend */
  mockBackend: MockPieceBackend = new MockPieceBackend();

  constructor(private loggingService: LoggingService, private http: HttpClient) { }

  /** Hits backend with all pieces GET request */
  requestAllPieces(): Promise<AllPiecesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllPieces();
    } else {
      return this.http.get<RawAllPiecesResponse>(environment.backendURL + "api/section").toPromise().then((val) => {
        return {
          data: {
            pieces: val.data.map((section) => {
              return {
                uuid: String(section.id),
                name: section.name,
                positions: section.positions.sort((a, b) => a.order < b.order ? -1 : 1).map((position) => {
                  return position.name;
                })
              }
            })
          },
          warnings: val.warnings
        }
      });
    }
  }

  /** Hits backend with one piece GET request */
  requestOnePiece(uuid: APITypes.UserUUID): Promise<OnePieceResponse> {
    return this.mockBackend.requestOnePiece(uuid);
  };

  /** Hits backend with create/edit piece POST request */
  requestPieceSet(piece: Piece): Promise<HttpResponse<any>> {
    return this.mockBackend.requestPieceSet(piece);
  }
  /** 
   * Hits backend with delete piece POST request */
  requestPieceDelete(piece: Piece): Promise<HttpResponse<any>> {
    return this.mockBackend.requestPieceDelete(piece);
  }

  /** All the loaded pieces mapped by UUID */
  pieces: Map<APITypes.PieceUUID, Piece> = new Map<APITypes.PieceUUID, Piece>();

  /** Emitter that is called whenever pieces are loaded */
  pieceEmitter: EventEmitter<Piece[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all users */
  private getAllPiecesResponse(): Promise<AllPiecesResponse> {
    return this.requestAllPieces().then(val => {
      // Update the pieces map
      this.pieces.clear();
      for (let piece of val.data.pieces) {
        this.pieces.set(piece.uuid, piece);
      }
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one piece */
  private getOnePieceResponse(uuid: APITypes.PieceUUID): Promise<OnePieceResponse> {
    return this.requestOnePiece(uuid).then(val => {
      // Update piece in map
      this.pieces.set(val.data.piece.uuid, val.data.piece);
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    })
  }

  /** Sends backend request and awaits reponse */
  private setPieceResponse(piece: Piece): Promise<HttpResponse<any>> {
    return this.requestPieceSet(piece);
  }

  /** Sends backend request and awaits reponse */
  private deletePieceResponse(piece: Piece): Promise<HttpResponse<any>> {
    return this.requestPieceDelete(piece);
  }

  /** Gets all the pieces from the backend and returns them */
  getAllPieces(): Promise<Piece[]> {
    return this.getAllPiecesResponse().then(val => {
      this.pieceEmitter.emit(Array.from(this.pieces.values()));
      return val;
    }).then(val => val.data.pieces);
  }

  /** Gets a specific piece from the backend by UUID and returns it */
  getPiece(uuid: APITypes.PieceUUID): Promise<Piece> {
    return this.getOnePieceResponse(uuid).then(val => {
      this.pieceEmitter.emit(Array.from(this.pieces.values()));
      return val;
    }).then(val => val.data.piece);
  }

  /** Requests an update to the backend which may or may not be successful,
   * depending on whether or not the piece is valid, as well as if the backend
   * request fails for some other reason.
   */
  setPiece(piece: Piece): Promise<APITypes.SuccessIndicator> {
    return this.setPieceResponse(piece).then(val => {
      if (val.status == 200) {
        this.getAllPieces();
        return {
          successful: true
        }
      } else {
        return {
          successful: false,
          error: "Server failed, try again."
        }
      }
    });
  }

  /** Requests for the backend to delete the piece */
  deletePiece(piece: Piece): Promise<APITypes.SuccessIndicator> {
    return this.deletePieceResponse(piece).then(val => {
      if (val.status == 200) {
        this.getAllPieces();
        return {
          successful: true
        }
      } else {
        return {
          successful: false,
          error: "Server failed, try again."
        }
      }
    });
  }


}

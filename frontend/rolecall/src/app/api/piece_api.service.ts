import { HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { APITypes } from 'src/types';
import { MockPieceBackend } from '../mocks/mock_piece_backend';
import { LoggingService } from '../services/logging.service';

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

  constructor(private loggingService: LoggingService) { }

  /** Hits backend with all pieces GET request */
  requestAllPieces(): Promise<AllPiecesResponse> {
    return this.mockBackend.requestAllPieces();
  }

  /** Hits backend with one piece GET request */
  requestOnePiece(uuid: APITypes.UserUUID): Promise<OnePieceResponse> {
    return this.mockBackend.requestOnePiece(uuid);
  };

  /** Hits backend with create/edit piece POST request */
  requestPieceSet(piece: Piece): Promise<HttpResponse<any>> {
    return this.mockBackend.requestPieceSet(piece);
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
      if (val.status == 400) {
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

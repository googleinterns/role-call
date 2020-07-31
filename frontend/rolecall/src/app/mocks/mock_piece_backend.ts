import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/types';
import { AllPiecesResponse, OnePieceResponse, Piece } from '../api/piece_api.service';

/**
 * Mocks the piece backend responses
 */
export class MockPieceBackend {

  /** Mock piece database */
  mockPieceDB: Piece[] = [
    {
      uuid: "PIECE1UUID",
      name: "Piece 1",
      positions: [
        "piece1pos1",
        "piece1pos2"
      ],
      deletePositions: []
    },
    {
      uuid: "PIECE2UUID",
      name: "Piece 2",
      positions: [
        "piece2pos1",
        "piece2pos2",
        "piece2pos3"
      ],
      deletePositions: []
    },
    {
      uuid: "PIECE3UUID",
      name: "Piece 3",
      positions: [
        "piece3pos1",
        "piece3pos2",
        "piece3pos3",
        "piece3pos4"
      ],
      deletePositions: []
    }
  ];
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
        piece: this.mockPieceDB.find(val => { return val.uuid == uuid || val.uuid === uuid })
      },
      warnings: []
    });
  };

  /** Mocks piece create/edit response */
  requestPieceSet(piece: Piece): Promise<HttpResponse<any>> {
    if (!this.shouldRejectSetRequest) {
      let pieceInd = this.mockPieceDB.findIndex((val) => val.uuid == piece.uuid);
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
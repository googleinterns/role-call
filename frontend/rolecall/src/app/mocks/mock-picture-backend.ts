
import * as APITypes from 'src/api-types';
import { OnePictureResponse, PictureInfo, PictureSetResponse
} from '../api/picture-api.service';

/** Mocks the unavailability backend responses. */
export class MockPictureBackend {

  /** Mock picture database. */
  mockDb: PictureInfo[] = [{
      id: 1,
      type: 'PROFILEPICTURE',
      fileType: 'png',
      dateUploaded: 1,
      ownerId: 4,
    },
  ];

  /** Mocks backend response. */
  requestOnePicture = (
    _uuid: APITypes.PictureUUID,
  ): Promise<OnePictureResponse> =>
    Promise.resolve({
        picture: new Blob(),
    } as OnePictureResponse);


  /** Mock setting the picture. */
  requestPictureSet = (
    _picture: FormData,
  ): Promise<PictureSetResponse> =>
    Promise.resolve({
      data: {
        pictureInfo: this.mockDb[0],
      },
      warnings: [],
    } as PictureSetResponse);


  // /** Mocks picture delete response. */
  // requestPictureDelete = (
  //   unav: Unavailability,
  // ): Promise<HttpResponse<any>> => {
  //   this.mockUnavailabilityDB =
  //       this.mockUnavailabilityDB.filter(val => val.id !== unav.id);
  //   return Promise.resolve({
  //     status: 200
  //   } as HttpResponse<any>);
  // };
}

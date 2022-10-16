import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MockPictureBackend } from '../mocks/mock-picture-backend';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { HeaderUtilityService, HeaderType,
} from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { SuccessIndicator } from 'src/api-types';


export type PictureInfo = {
  id: number;
  type: string;
  fileType: string;
  dateUploaded: number;
  ownerId: number;
};

export type CacheSetReturn = {
  ok: SuccessIndicator;
  rawItem: unknown;
  warnings: string[];
};

export type OnePictureResponse = {
  picture: Blob;
};

export type PictureSetResponse = {
  data: {
    pictureInfo: PictureInfo;
  };
  warnings: string[];
};

@Injectable({providedIn: 'root'})
export class PictureApi {
  mockBackend = new MockPictureBackend();;

  constructor(
    private http: HttpClient,
    private respHandler: ResponseStatusHandlerService,
    private headerUtil: HeaderUtilityService,
  ) {
  }

  /** Hits backend with all segments GET request. */
  requestOnePicture = async (
    fileName: APITypes.PictureUUID,
  ): Promise<OnePictureResponse> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestOnePicture(fileName);
    }
    const splits = fileName.split('.');
    const fileType = splits[1].toLowerCase() === 'png'
      ? HeaderType.png : HeaderType.jpg;
    const header = await this.headerUtil.generateHeader(fileType);
    return lastValueFrom(this.http.get<OnePictureResponse>(
        environment.backendURL + environment.picPath + fileName, {
          headers: header,
          observe: 'response',
          withCredentials: true,
          responseType: 'blob' as 'json', // dirty trick
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<Blob>(
            resp)).then(val => ({
            picture: val,
        }));
  };

  /** Hits backend with create/edit pictureFile POST request. */
  requestPictureSet = async (
    pictureFile: FormData,
  ): Promise<PictureSetResponse> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestPictureSet(pictureFile);
    }
    // Do post
console.log('POST', pictureFile);
    const header = await this.headerUtil.generateHeader(HeaderType.formData);
    return lastValueFrom(this.http.post(
      environment.backendURL + 'api/profile_picture',
          pictureFile, {
          headers: header,
          observe: 'response',
          withCredentials: true
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  };

  /** Gets all the picture from the backend and returns them. */
  getOnePicture = async (
    fileName: APITypes.PictureUUID,
  ): Promise<Blob> =>
      this.getOnePictureResponse(fileName).then(val => val)
      .catch(() => {})
      .then(val => val ? val.picture : new Blob());

  /**
   * Saves a new picture and deletes the prior picture if one exists.
   */
  setPicture = async (
    pictureFile: FormData,
  ): Promise<CacheSetReturn> =>
    this.setPictureResponse(pictureFile).then((res) => {
        const opRes = res as unknown as PictureSetResponse;
        const picInfo = opRes.data as unknown as PictureInfo;
        return {
          ok: { successful: true, } as SuccessIndicator,
          rawItem: picInfo,
          warnings: [],
        };
      })
      .catch(reason => ({
          ok: {
            successful: false,
            error: reason,
          },
          rawItem: {},
          warnings: [],
      })
  );

  // Private methods

  /** Takes backend response, updates data structures for all segments. */
  private getOnePictureResponse = async (
    id: APITypes.PictureUUID,
  ): Promise<OnePictureResponse> =>
      this.requestOnePicture(id);

  /** Sends backend request and awaits response. */
  private setPictureResponse = async (
    pictureFile: FormData,
  ): Promise<PictureSetResponse> =>
    this.requestPictureSet(pictureFile);

}

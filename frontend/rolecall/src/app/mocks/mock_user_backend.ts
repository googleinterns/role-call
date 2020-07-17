import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { AllUsersResponse, OneUserResponse, User } from "../api/user-api.service";

/**
 * Mocks the user backend responses
 */
export class MockUserBackend {

  constructor() {
    this.mockUsers();
  }

  /** Mock user database */
  mockUserDB: User[] = [];

  /** Mock the user database */
  mockUsers() {

  }

  /** Mocks backend response */
  requestAllUsers(): Promise<AllUsersResponse> {
    return Promise.resolve({
      data: {
        users: this.mockUserDB
      },
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOneUser(uuid: APITypes.UserUUID): Promise<OneUserResponse> {
    return Promise.resolve({
      data: {
        user: this.mockUserDB.find(val => { return val.uuid == uuid || val.uuid === uuid })
      },
      warnings: []
    });
  };

  /** Mocks user create/edit response */
  requestUserSet(user: User): Promise<HttpResponse<any>> {
    if (this.isValidUser(user)) {
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    }
  }

  /** Checks if user is valid, like the backend */
  private isValidUser(user: User): boolean {
    return !isNullOrUndefined(user.uuid) && !isNullOrUndefined(user.first_name) &&
      !isNullOrUndefined(user.last_name) && !isNullOrUndefined(user.has_privilege_classes) &&
      user.has_privilege_classes.length >= 1;
  }

}
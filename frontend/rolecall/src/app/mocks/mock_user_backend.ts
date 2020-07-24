import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { AllUsersResponse, OneUserResponse, User } from "../api/user_api.service";

/**
 * Mocks the user backend responses
 */
export class MockUserBackend {

  /** Mock user database */
  mockUserDB: User[] = [
    {
      uuid: "USERUUID1",
      has_permissions: {
        isAdmin: true,
        notifications: true,
        canLogin: true,
        manageCasts: true,
        managePerformances: true,
        managePieces: true,
        manageRoles: true,
        manageRules: true
      },
      knows_positions: [
        {
          segment: "PIECE1UUID",
          position: "Lead"
        },
        {
          segment: "PIECE2UUID",
          position: "Background"
        }
      ],
      has_privilege_classes: [
        "admin"
      ],
      first_name: "USER1First",
      last_name: "USER1Last",
      contact_info: {
        phone_number: "1123456789",
        email: "USER1@gmail.com",
        emergency_contact: {
          name: "USER1 Emergency Contact Name",
          phone_number: "1198765432",
          email: "USER1EMG@gmail.com"
        }
      },
      date_of_birth: 1
    },
    {
      uuid: "USERUUID2",
      has_permissions: {
        isAdmin: false,
        notifications: true,
        canLogin: true,
        manageCasts: true,
        managePerformances: false,
        managePieces: true,
        manageRoles: false,
        manageRules: false
      },
      knows_positions: [
        {
          segment: "PIECE1UUID",
          position: "Background"
        },
        {
          segment: "PIECE2UUID",
          position: "Lead"
        }
      ],
      has_privilege_classes: [
        "choreographer"
      ],
      first_name: "USER2First",
      last_name: "USER2Last",
      contact_info: {
        phone_number: "2123456789",
        email: "USER2@gmail.com",
        emergency_contact: {
          name: "USER2 Emergency Contact Name",
          phone_number: "2198765432",
          email: "USER2EMG@gmail.com"
        }
      },
      date_of_birth: 1
    }
  ];

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


  requestUserSet(user: User): Promise<HttpResponse<any>> {
    if (this.isValidUser(user)) {
      let userInd = this.mockUserDB.findIndex((val) => val.uuid == user.uuid);
      if (userInd == -1) {
        this.mockUserDB.push(user);
      } else {
        this.mockUserDB[userInd] = user;
      }
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    }
  }

  /** Mocks user delete response */
  requestUserDelete(user: User): Promise<HttpResponse<any>> {
    this.mockUserDB = this.mockUserDB.filter(val => val.uuid != user.uuid);
    return Promise.resolve({
      status: 400
    } as HttpResponse<any>);
  }

  /** Checks if user is valid, like the backend */
  public isValidUser(user: User): boolean {
    return !isNullOrUndefined(user.uuid) && !isNullOrUndefined(user.contact_info.email) && !isNullOrUndefined(user.first_name) &&
      !isNullOrUndefined(user.last_name) && !isNullOrUndefined(user.has_permissions);
  }

}
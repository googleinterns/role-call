import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APITypes } from 'src/types';
import { isNullOrUndefined } from 'util';
import { MockUserBackend } from '../mocks/mock_user_backend';
import { LoggingService } from '../services/logging.service';


export type User = {
  uuid: APITypes.UserUUID,
  has_permissions: APITypes.PermissionSet,
  has_privilege_classes?: APITypes.PrivilegeClassUUID[],
  knows_positions: APITypes.Position[],
  first_name: string,
  last_name: string,
  date_of_birth: number,
  contact_info: {
    phone_number: string,
    email: string,
    emergency_contact: {
      name: string,
      phone_number: string,
      email: string
    }
  }
};

type RawAllUsersResponse = {
  data: {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    dateJoined: string,
    emergencyContactName: string,
    emergencyContactNumber: string,
    comments: string,
    canLogin: boolean,
    admin: boolean,
    notifications: boolean,
    managePerformances: boolean,
    manageCasts: boolean,
    managePieces: boolean,
    manageRoles: boolean,
    manageRules: boolean,
    isActive: boolean
  }[],
  warnings: string[]
}

export type AllUsersResponse = {
  data: {
    users: User[]
  },
  warnings: string[]
};

export type OneUserResponse = {
  data: {
    user: User
  },
  warnings: string[]
};


/**
 * A service responsible for interfacing with the User API and
 * keeping track of all users by ID
 */
@Injectable({
  providedIn: 'root'
})
export class UserApi {

  /** Mock backend */
  mockBackend: MockUserBackend = new MockUserBackend();

  constructor(private loggingService: LoggingService, private http: HttpClient) { }

  /** Hits backend with all users GET request */
  requestAllUsers(): Promise<AllUsersResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllUsers();
    }
    return this.http.get<RawAllUsersResponse>(environment.backendURL + "api/user").toPromise().then((val) => {
      return {
        data: {
          users: val.data.map((val) => {
            return {
              uuid: String(val.id),
              has_permissions: {
                canLogin: val.canLogin,
                isAdmin: val.admin,
                notifications: val.notifications,
                managePerformances: val.managePerformances,
                manageCasts: val.manageCasts,
                managePieces: val.managePieces,
                manageRoles: val.manageRoles,
                manageRules: val.manageRules
              },
              has_privilege_classes: [],
              knows_positions: [],
              first_name: val.firstName,
              last_name: val.lastName,
              date_of_birth: 0,
              contact_info: {
                phone_number: "N/A",
                email: val.email,
                emergency_contact: {
                  name: val.emergencyContactName,
                  phone_number: val.emergencyContactNumber,
                  email: "N/A"
                }
              }
            }
          })
        },
        warnings: val.warnings
      }
    }).catch(err => {
      this.loggingService.logError(err);
      return Promise.resolve({
        data: {
          users: []
        },
        warnings: []
      })
    });
  }

  /** Hits backend with one user GET request */
  requestOneUser(uuid: APITypes.UserUUID): Promise<OneUserResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestOneUser(uuid);
    }
    return this.mockBackend.requestOneUser(uuid);
  };

  /** Hits backend with create/edit user POST request */
  requestUserSet(user: User): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestUserSet(user);
    }
    return this.mockBackend.requestUserSet(user);
  }

  /** Hits backend with delete user POST request */
  requestUserDelete(user: User): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestUserDelete(user);
    }
    return this.mockBackend.requestUserDelete(user);
  }

  /** All the loaded users mapped by UUID */
  users: Map<APITypes.UserUUID, User> = new Map<APITypes.UserUUID, User>();

  /** Emitter that is called whenever users are loaded */
  userEmitter: EventEmitter<User[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all users */
  private getAllUsersResponse(): Promise<AllUsersResponse> {
    return this.requestAllUsers().then(val => {
      // Update the users map
      this.users.clear();
      for (let user of val.data.users) {
        this.users.set(user.uuid, user);
      }
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one user */
  private getOneUserResponse(uuid: APITypes.UserUUID): Promise<OneUserResponse> {
    return this.requestOneUser(uuid).then(val => {
      // Update user in map
      this.users.set(val.data.user.uuid, val.data.user);
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    })
  }

  /** Sends backend request and awaits reponse */
  private setUserResponse(user: User): Promise<HttpResponse<any>> {
    return this.requestUserSet(user);
  }

  /** Sends backend request and awaits reponse */
  private deleteUserResponse(user: User): Promise<HttpResponse<any>> {
    return this.requestUserDelete(user);
  }

  /** Gets all the users from the backend and returns them */
  getAllUsers(): Promise<User[]> {
    return this.getAllUsersResponse().then(val => {
      this.userEmitter.emit(Array.from(this.users.values()));
      return val;
    }).then(val => val.data.users);
  }

  /** Gets a specific user from the backend by UUID and returns it */
  getUser(uuid: APITypes.UserUUID): Promise<User> {
    return this.getOneUserResponse(uuid).then(val => {
      this.userEmitter.emit(Array.from(this.users.values()));
      return val;
    }).then(val => val.data.user);
  }

  /** Requests an update to the backend which may or may not be successful,
   * depending on whether or not the user is valid, as well as if the backend
   * request fails for some other reason.
   */
  setUser(user: User): Promise<APITypes.SuccessIndicator> {
    if (this.isValidUser(user)) {
      return this.setUserResponse(user).then(val => {
        if (val.status == 400) {
          this.getAllUsers();
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
    } else {
      return Promise.resolve({
        successful: false,
        error: "Invalid user object"
      });
    }
  }

  /** Requests for the backend to delete the user */
  deleteUser(user: User): Promise<APITypes.SuccessIndicator> {
    return this.deleteUserResponse(user).then(val => {
      if (val.status == 400) {
        this.getAllUsers();
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

  /** Determines if the user object provided is valid for storage in the database */
  public isValidUser(user: User): boolean {
    return !isNullOrUndefined(user.uuid) && !isNullOrUndefined(user.contact_info.email) && !isNullOrUndefined(user.first_name) &&
      !isNullOrUndefined(user.last_name) && !isNullOrUndefined(user.has_permissions);
  }

}

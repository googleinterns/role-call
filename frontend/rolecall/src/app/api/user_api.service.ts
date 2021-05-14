import {HttpClient, HttpResponse} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import * as moment from 'moment';
import * as APITypes from 'src/api_types';
import {environment} from 'src/environments/environment';
//import {isNullOrUndefined} from 'util';

import {MockUserBackend} from '../mocks/mock_user_backend';
import {HeaderUtilityService} from '../services/header-utility.service';
import {LoggingService} from '../services/logging.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

export type User = {
  uuid: APITypes.UserUUID;
  has_roles: APITypes.Roles;
  has_permissions: APITypes.Permissions;
  knows_positions: APITypes.Position[];
  first_name: string | undefined;
  middle_name: string | undefined;
  last_name: string | undefined;
  suffix: string | undefined;
  picture_file: string | undefined;
  date_joined: number | undefined;
  contact_info: {
    phone_number: string | undefined;
    email: string | undefined;
    notification_email: string | undefined;
    emergency_contact: {
      name: string | undefined;
      phone_number: string | undefined;
      email: string | undefined;
    }
  }
};

interface RawUser {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  pictureFile: string;
  email: string;
  notificationEmail: string;
  phoneNumber: string;
  dateJoined: string;
  isAdmin: boolean;
  isChoreographer: boolean;
  isDancer: boolean;
  isOther: boolean;
  canLogin: boolean;
  notifications: boolean;
  managePerformances: boolean;
  manageCasts: boolean;
  managePieces: boolean;
  manageRoles: boolean;
  manageRules: boolean;
  emergencyContactName: string;
  emergencyContactNumber: string;
  comments: string;
  isActive: boolean;
}

type RawAllUsersResponse = {
  data: RawUser[],
  warnings: string[]
};

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
 * keeping track of all users by ID.
 */
@Injectable({providedIn: 'root'})
export class UserApi {
  /** Mock backend. */
  mockBackend: MockUserBackend = new MockUserBackend();

  /** All the loaded users mapped by UUID. */
  users: Map<APITypes.UserUUID, User> = new Map<APITypes.UserUUID, User>();

  /** Emitter that is called whenever users are loaded. */
  userEmitter: EventEmitter<User[]> = new EventEmitter();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService) {
  }

  /** Hits backend with all users GET request. */
  async requestAllUsers(): Promise<AllUsersResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllUsers();
    }
    return this.http.get<RawAllUsersResponse>(
        environment.backendURL + 'api/user', {
              headers: await this.headerUtil.generateHeader(),
              observe: 'response',
              withCredentials: true
            })
        .toPromise()
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<RawAllUsersResponse>(resp))
        .then(rawAllUsersResponse => {
          return {
            data: {
              users: rawAllUsersResponse.data.map(rawUser => {
                return {
                  uuid: String(rawUser.id),
                  has_roles: {
                    isAdmin: rawUser.isAdmin,
                    isChoreographer: rawUser.isChoreographer,
                    isDancer: rawUser.isDancer,
                    isOther: rawUser.isOther,
                  },
                  has_permissions: {
                    canLogin: rawUser.canLogin,
                    canReceiveNotifications: rawUser.notifications,
                    managePerformances: rawUser.managePerformances,
                    manageCasts: rawUser.manageCasts,
                    manageBallets: rawUser.managePieces,
                    manageRoles: rawUser.manageRoles,
                    manageRules: rawUser.manageRules
                  },
                  knows_positions: [],
                  first_name: rawUser.firstName,
                  middle_name: rawUser.middleName,
                  last_name: rawUser.lastName,
                  suffix: rawUser.suffix,
                  picture_file: rawUser.pictureFile,
                  date_joined: moment(rawUser.dateJoined, 'MM-DD-YYYY')
                      .valueOf(),
                  contact_info: {
                    phone_number: rawUser.phoneNumber,
                    email: rawUser.email,
                    notification_email: rawUser.notificationEmail,
                    emergency_contact: {
                      name: rawUser.emergencyContactName,
                      phone_number: rawUser.emergencyContactNumber,
                      email: 'N/A'
                    }
                  }
                };
              })
            },
            warnings: rawAllUsersResponse.warnings
          };
        });
  }

  /** Hits backend with one user GET request. */
  requestOneUser(uuid: APITypes.UserUUID): Promise<OneUserResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestOneUser(uuid);
    }
    return this.mockBackend.requestOneUser(uuid);
  }

  /** Hits backend with create/edit user POST request. */
  async requestUserSet(user: User): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestUserSet(user);
    }
    if (this.users.has(user.uuid)) {
      // Do patch
      return this.http
          .patch(
              environment.backendURL + 'api/user', {
                id: Number(user.uuid),
                firstName: user.first_name,
                middleName: user.middle_name,
                lastName: user.last_name,
                suffix: user.suffix,
                pictureFile: user.picture_file,
                email: user.contact_info.email,
                notificationEmail: user.contact_info.notification_email,
                phoneNumber: user.contact_info.phone_number,
                dateJoined:
                    moment(user.date_joined).format('MM-DD-YYYY').toString(),
                // Roles
                isAdmin: user.has_roles.isAdmin,
                isChoreographer: user.has_roles.isChoreographer,
                isDancer: user.has_roles.isDancer,
                isOther: user.has_roles.isOther,
                // Permissions
                canLogin: user.has_permissions.canLogin,
                canReceiveNotifications:
                user.has_permissions.canReceiveNotifications,
                managePerformances: user.has_permissions.managePerformances,
                manageCasts: user.has_permissions.manageCasts,
                managePieces: user.has_permissions.manageBallets,
                manageRoles: user.has_permissions.manageRoles,
                manageRules: user.has_permissions.manageRules,
                // Other
                emergencyContactName: user.contact_info.emergency_contact.name,
                emergencyContactNumber:
                user.contact_info.emergency_contact.phone_number,
                isActive: true
              },
              {
                headers: await this.headerUtil.generateHeader(),
                observe: 'response',
                withCredentials: true
              })
          .toPromise()
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    } else {
      // Do post
      return this.http
          .post(
              environment.backendURL + 'api/user', {
                firstName: user.first_name,
                middleName: user.middle_name,
                lastName: user.last_name,
                suffix: user.suffix,
                pictureFile: user.picture_file,
                email: user.contact_info.email,
                notificationEmail: user.contact_info.notification_email,
                phoneNumber: user.contact_info.phone_number,
                dateJoined:
                    moment(user.date_joined).format('MM-DD-YYYY').toString(),
                // Roles
                isAdmin: user.has_roles.isAdmin,
                isChoreographer: user.has_roles.isChoreographer,
                isDancer: user.has_roles.isDancer,
                isOther: user.has_roles.isOther,
                // Permissions
                canLogin: user.has_permissions.canLogin,
                canReceiveNotifications:
                user.has_permissions.canReceiveNotifications,
                managePerformances: user.has_permissions.managePerformances,
                manageCasts: user.has_permissions.manageCasts,
                managePieces: user.has_permissions.manageBallets,
                manageRoles: user.has_permissions.manageRoles,
                manageRules: user.has_permissions.manageRules,
                // Other
                emergencyContactName: user.contact_info.emergency_contact.name,
                emergencyContactNumber:
                user.contact_info.emergency_contact.phone_number,
                isActive: true
              },
              {
                observe: 'response',
                headers: await this.headerUtil.generateHeader(),
                withCredentials: true
              })
          .toPromise()
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    }
  }

  /** Hits backend with delete user POST request. */
  async requestUserDelete(user: User): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestUserDelete(user);
    }
    return this.http.delete(
        environment.backendURL + 'api/user?userid=' + user.uuid, {
              observe: 'response',
              headers: await this.headerUtil.generateHeader(),
              withCredentials: true
            })
        .toPromise()
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  }

  /** Takes backend response, updates data structures for all users. */
  private getAllUsersResponse(): Promise<AllUsersResponse> {
    return this.requestAllUsers().then(val => {
      // Update the users map
      this.users.clear();
      for (const user of val.data.users) {
        this.users.set(user.uuid, user);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one user. */
  private getOneUserResponse(uuid: APITypes.UserUUID):
      Promise<OneUserResponse> {
    return this.requestOneUser(uuid).then(val => {
      // Update user in map
      this.users.set(val.data.user.uuid, val.data.user);
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Sends backend request and awaits response. */
  private setUserResponse(user: User): Promise<HttpResponse<any>> {
    return this.requestUserSet(user);
  }

  /** Sends backend request and awaits response. */
  private deleteUserResponse(user: User): Promise<HttpResponse<any>> {
    return this.requestUserDelete(user);
  }

  /** Gets all the users from the backend and returns them. */
  getAllUsers(): Promise<User[]> {
    return this.getAllUsersResponse().then(val => {
          this.userEmitter.emit(Array.from(this.users.values()));
          return val;
        })
        .then(val => val.data.users)
        .catch(() => []);
  }

  /** Gets a specific user from the backend by UUID and returns it. */
  getUser(uuid: APITypes.UserUUID): Promise<User> {
    return this.getOneUserResponse(uuid).then(val => {
          this.userEmitter.emit(Array.from(this.users.values()));
          return val;
        })
        .then(val => val.data.user);
  }

  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the user is valid, as well as if the backend
   * request fails for some other reason.
   */
  setUser(user: User): Promise<APITypes.SuccessIndicator> {
    return this.setUserResponse(user).then(() => {
          this.getAllUsers();
          return {
            successful: true
          };
        })
        .catch(reason => {
          return Promise.resolve({
            successful: false,
            error: reason
          });
        });
  }

  /** Requests for the backend to delete the user. */
  deleteUser(user: User): Promise<APITypes.SuccessIndicator> {
    return this.deleteUserResponse(user).then(() => {
          this.getAllUsers();
          return {
            successful: true
          };
        })
        .catch(reason => {
          return {
            successful: false,
            error: reason
          };
        });
  }

  /**
   * Determines if the user object provided is valid for storage in the
   * database.
   */
  public isValidUser(user: User): boolean {
    return !!user
           && !!user.uuid
           && !!user.contact_info.email
           && !!user.first_name
           && !!user.last_name
           && !!user.has_permissions;
  }
}

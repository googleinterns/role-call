/* eslint-disable @typescript-eslint/naming-convention */

import { Injectable } from '@angular/core';
import { CrudApi } from './crud-api.service';
import { PictureApi } from './picture-api.service';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { MockUserBackend } from '../mocks/mock-user-backend';
import { DataCache } from '../utils/data-cache';

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
    };
  };
  // For frontend use only. Not saved.
  isAbsent?: boolean;
  image?: string | ArrayBuffer | Blob;
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

/**
 * A service responsible for interfacing with the User API and
 * keeping track of all users by ID.
 */
@Injectable({providedIn: 'root'})
export class UserApi {

  cache: DataCache<APITypes.UserUUID>;

  constructor(
      public crudApi: CrudApi<APITypes.UserUUID>,
      public pictureApi: PictureApi,
  ) {
    this.cache = new DataCache<APITypes.UserUUID>({
      name: 'User',
      apiName: 'api/user',
      ixName: 'userid',
      crudApi: this.crudApi,
      getIx: this.getIx,
      fromRaw: this.convertRawToUser,
      toRaw: this.convertUserToRaw,
      sortCmp: this.userCmp,
      mockBackend: new MockUserBackend(),
    });
  }

  userCmp = (a: unknown, b: unknown): number =>
      ( a as User ).last_name.toLowerCase() <
      ( b as User ).last_name.toLowerCase() ? -1 : 1;

  newUser = (): User => ({
      uuid: 'newUser:' + Date.now(),
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      picture_file: undefined,
      has_roles: {
        isAdmin: false,
        isChoreographer: false,
        isDancer: false,
        isOther: false,
      },
      has_permissions: {
        canLogin: true,
        canReceiveNotifications: true,
        managePerformances: false,
        manageCasts: false,
        manageBallets: false,
        manageRoles: false,
        manageRules: false
      },
      date_joined: Date.now(),
      contact_info: {
        phone_number: '',
        email: '',
        notification_email: '',
        emergency_contact: {
          name: '',
          phone_number: '',
          email: '',
        },
      },
      isAbsent: false,
      knows_positions: [],
    });


  convertRawToUser = (
    rawItem: unknown,
  ): User => {
    const rawUser = rawItem as RawUser;
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
      date_joined: Date.parse(rawUser.dateJoined),
      contact_info: {
        phone_number: rawUser.phoneNumber,
        email: rawUser.email,
        notification_email: rawUser.notificationEmail,
        emergency_contact: {
          name: rawUser.emergencyContactName,
          phone_number: rawUser.emergencyContactNumber,
          email: 'N/A',
        },
      },
      isAbsent: false,
    };
  };


  convertUserToRaw = (
    item: unknown,
    exists: boolean,
  ): unknown => {
    const user = item as User;
    return {
      id: exists ? Number(user.uuid) : null,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      suffix: user.suffix,
      pictureFile: user.picture_file,
      email: user.contact_info.email,
      notificationEmail: user.contact_info.notification_email,
      phoneNumber: user.contact_info.phone_number,
      dateJoined: new Date(user.date_joined).toISOString(),
      // Roles
      isAdmin: user.has_roles.isAdmin,
      isChoreographer: user.has_roles.isChoreographer,
      isDancer: user.has_roles.isDancer,
      isOther: user.has_roles.isOther,
      // Permissions
      canLogin: user.has_permissions.canLogin,
      notifications: user.has_permissions.canReceiveNotifications,
      managePerformances: user.has_permissions.managePerformances,
      manageCasts: user.has_permissions.manageCasts,
      managePieces: user.has_permissions.manageBallets,
      manageRoles: user.has_permissions.manageRoles,
      manageRules: user.has_permissions.manageRules,
      // Other
      emergencyContactName: user.contact_info.emergency_contact.name,
      emergencyContactNumber:
      user.contact_info.emergency_contact.phone_number,
      comments: null,
      isActive: true
    };
  };

  /**
   * Determines if the user object provided is valid for storage in the
   * database.
   */
  public isValidUser = (user: User): boolean =>
    !!user
      && !!user.uuid
      && !!user.contact_info.email
      && !!user.first_name
      && !!user.last_name
      && !!user.has_permissions;


  // Cache support

  public getIx = (item: unknown): APITypes.UserUUID =>
    ( item as User ).uuid;

  loadAllUsers = async (
    forceDbRead: boolean = false,
  ): Promise<User[]> => {
    if (forceDbRead || !this.cache.isLoaded) {
      return await this.cache.loadAll() as User[];
    }
    return this.cache.refreshData() as User[];
  };

  lookup = (ix: APITypes.UserUUID): User =>
    this.cache.map.get(ix) as User;


  // Picture load methods

  loadAllPictures = async (): Promise<void> => {
    this.cache.map.forEach(user => {
      this.loadOnePicture(user as User);
    });
  };

  loadOnePicture = async (user: User): Promise<void> => {
    if (user.picture_file) {
      // temporary cleanup
      if (user.picture_file.includes('/')) {
        console.log(user.first_name, user.last_name, 'BAD PICTURE ID',
            user.picture_file);
        user.picture_file = '';
      } else {
        this.pictureApi.getOnePicture(user.picture_file).then(img => {
          if (!!img) {
            const reader = new FileReader();
            reader.onload = function(): void {
              user.image = this.result;
            };
            if (environment.name === 'dev') {
              reader.readAsDataURL(img);
            } else {
              reader.readAsText(img);
            }
          } else {
            console.log('Setting picture to blank');
            user.picture_file = '';
          }
        });
      }
    }
  };
}

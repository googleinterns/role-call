/* eslint-disable @typescript-eslint/naming-convention */

import { Location } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, UserApi } from '../api/user-api.service';
import { PictureApi, PictureInfo } from '../api/picture-api.service';
import {NgxImageCompressService} from "ngx-image-compress";
/**
 * The view for the User Editor, allowing users to create other users
 * and view user information.
 */
@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class UserEditor implements OnInit, OnDestroy {
  @ViewChild('inputPicture') inputPicture: ElementRef;

  permissionsSet: EventEmitter<string[]> = new EventEmitter();
  rolesSet: EventEmitter<string[]> = new EventEmitter();

  currentSelectedUser: User;
  renderingUsers: User[];

  rolesNamesMap = {
    isAdmin: 'Is Admin',
    isChoreographer: 'Is Choreographer',
    isDancer: 'Is Dancer',
    isOther: 'Is Other',
  };

  permissionsNamesMap = {
    canLogin: 'Can Login',
    canReceiveNotifications: 'Receives Notifications',
    managePerformances: 'Manages Performances',
    manageCasts: 'Manages Casts',
    manageBallets: 'Manages Ballets',
    manageRoles: 'Manages Roles',
    manageRules: 'Manages Rules',
  };

  formData: FormData;

  canDelete = false;
  canSave = false;
  hasNewPicture = false;

  creatingUser = false;

  usersLoaded = false;

  private urlPointingUUID: string;

  private prevWorkingState: User | undefined;
  private workingUser: User | undefined;

  private userSubscription: Subscription;

  private dataLoaded = false;

  private lastSelectedUserEmail: string;

  private nameToPropertyMap = {
    'First Name': {
      key: 'first_name',
      type: 'string'
    },
    'Middle Name': {
      key: 'middle_name',
      type: 'string'
    },
    'Last Name': {
      key: 'last_name',
      type: 'string'
    },
    Suffix: {
      key: 'suffix',
      type: 'string'
    },
    'Notification Email': {
      key: 'contact_info.notification_email',
      type: 'string'
    },
    Email: {
      key: 'contact_info.email',
      type: 'string'
    },
    Phone: {
      key: 'contact_info.phone_number',
      type: 'string'
    },
    'Picture File': {
      key: 'picture_file',
      type: 'string'
    },
    'Date Joined': {
      key: 'date_joined',
      type: 'date'
    },
    Roles: {
      key: 'has_roles',
      type: 'roles'
    },
    Permissions: {
      key: 'has_permissions',
      type: 'permissions'
    },
  };

  private currentDate = Date.now();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly userApi: UserApi,
    private readonly pictureApi: PictureApi,
    private imageCompress: NgxImageCompressService
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    const uuid: string = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlPointingUUID = uuid;
    }
    this.userSubscription = this.userApi.cache.loadedAll.subscribe(users => {
      this.onUserLoad(users as User[]);
    });
    this.userApi.loadAllUsers();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  refreshData = (): void => {
    this.usersLoaded = false;
    this.userApi.loadAllUsers(true);
  };

  setCurrentUser = async ({user, fromInputChange, shouldSetLastUser}: {
    user: User | undefined;
    fromInputChange?: boolean;
    shouldSetLastUser?: boolean;
  }): Promise<void> => {
    if (shouldSetLastUser) {
      this.lastSelectedUserEmail = user.contact_info.email;
    }

    if (user && this.currentSelectedUser && user.uuid
        !== this.currentSelectedUser.uuid) {
      this.creatingUser = false;
      this.canDelete = true;
      this.canSave = false;
    }
    if (this.workingUser && user.uuid !== this.workingUser.uuid) {
      this.renderingUsers = this.renderingUsers.filter(
          renderingUser => renderingUser.uuid !== this.workingUser.uuid
                           && this.userApi.isValidUser(renderingUser));
      if (this.prevWorkingState) {
        this.currentSelectedUser = this.prevWorkingState;
        this.renderingUsers.push(this.currentSelectedUser);
      }
      this.prevWorkingState = undefined;
      this.workingUser = undefined;
    }

    this.hasNewPicture = false;
    this.currentSelectedUser = user;
    if (!fromInputChange) {
      if (!this.currentSelectedUser) {
        this.rolesSet.emit([]);
        this.permissionsSet.emit([]);
      } else {
        this.rolesSet.emit(this.getSelectedRoles(this.currentSelectedUser));
        this.permissionsSet.emit(
            this.getSelectedPermissions(this.currentSelectedUser));
      }
    }

    if (this.location.path().startsWith('/user') || this.location.path()
        .startsWith('/user/')) {
      this.location.replaceState('/user/' + user.uuid);
    }
    this.urlPointingUUID = user.uuid;
    this.renderingUsers.sort((a, b) =>
      a.last_name.toLowerCase() < b.last_name.toLowerCase() ? -1 : 1);
  };

  canAddUser = (): boolean =>
    true;


  addUser = (): void => {
    if (this.creatingUser) {
      return;
    }
    this.creatingUser = true;
    this.canSave = true;
    this.prevWorkingState = undefined;
    this.hasNewPicture = false;
    const newUser = this.userApi.newUser();
    this.currentSelectedUser = newUser;
    this.renderingUsers.push(newUser);
    this.workingUser = newUser;
    this.setCurrentUser({user: this.workingUser});
  };

  canDeleteUser = (): boolean =>
   this.canDelete;


  deleteUser = (): void => {
    this.prevWorkingState = undefined;
    this.renderingUsers = this.renderingUsers.filter(
        user => user.uuid !== this.currentSelectedUser.uuid);

    if (!this.creatingUser) {
      this.userApi.cache.delete(this.currentSelectedUser);
    }
    if (this.renderingUsers.length > 0) {
      this.setCurrentUser({user: this.renderingUsers[0]});
    } else {
      this.setCurrentUser({user: undefined});
    }
  };

  canSaveUser = (): boolean =>
    this.canSave || this.hasNewPicture;


  saveUser = async (): Promise<void> => {
    if (this.hasNewPicture) {
      // SAVE PICTURE
      const ret = await this.pictureApi.setPicture(this.formData);
      if (ret.ok.successful) {
        const picInfo = ret.rawItem as PictureInfo;
        this.workingUser.picture_file = `${picInfo.id}.${picInfo.fileType}`;
        this.saveUserRecord();
      }
    }
    else if (this.canSave) {
      this.saveUserRecord();
    }
  };

  saveUserRecord = async (): Promise<void> => {
    this.lastSelectedUserEmail = this.workingUser.contact_info.email;
    await this.userApi.cache.set(this.workingUser).then(async result => {
        if (result.successful) {
          this.creatingUser = false;
          this.canDelete = true;
          this.canSave = false;
          const prevUUID = this.workingUser.uuid;
          this.prevWorkingState = undefined;
          this.workingUser = undefined;
          this.userApi.loadAllUsers();
          const foundSame = this.renderingUsers.find(
              user => user.uuid === prevUUID);
          if (foundSame && this.location.path().startsWith('user')) {
            this.setCurrentUser({user: foundSame});
          }
        }
    });
  };

  getCurrentDate = (): number =>
    this.currentDate;


  getAllRoles = (): string[] =>
    Object.keys(this.rolesNamesMap);


  getAllPermissions = (): string[] =>
    Object.keys(this.permissionsNamesMap);


  getSelectedPermissions = (user: User): string[] => {
    if (!user) {
      return [];
    }
    return Object.entries(user.has_permissions)
        .filter(([, selected]) => selected)
        .map(([permission]) => permission);
  };

  onInputChange = (change: [string, any]): void => {
    const valueName = change[0];
    const value = change[1];

    this.checkWorkingUser();

    if (this.workingUser) {
      this.setWorkingPropertyByKey(valueName, value);
    }
  };

  checkWorkingUser = (): void => {
    if (!this.workingUser && this.currentSelectedUser) {
      this.prevWorkingState =
          JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.workingUser = JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.setCurrentUser({user: this.workingUser, fromInputChange: true});
    }
  };

  onPictureLoad = (event: Event): void => {
    const file = (event.target as HTMLInputElement).files[0];
    if (!file) {
      return;
    }
    if (!file.type.match('image.*')) {
      alert('Only images are supported');
      return;
    }

    this.checkWorkingUser();
    this.formData = new FormData();
    this.formData.append('userid', this.workingUser.uuid);
   // this.formData.append('file', file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ((): void => {
      this.currentSelectedUser.image = reader.result;
      this.hasNewPicture = true;
      this.canSave = true;

      this.imageCompress.compressFile(<string>reader.result, null, 100, 100, 320, 320) // 50% ratio, 50% quality
        .then(
          (compressedImage) => {    
           // console.log(compressedImage)   ;
            this.formData.append('file', this.dataURItoBlob(compressedImage), file.name);
          }
        );
      
    }).bind(this) ;
  };

  dataURItoBlob = (dataURI): Blob => {
    let arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  getPicture = (): void => {
    this.inputPicture.nativeElement.click();
  };

  // Private methods

  private onUserLoad = (users: User[]): void => {
    if (users.length === 0) {
      this.renderingUsers = [];
      return;
    }
    if (this.renderingUsers) {
      const prevUserUUIDS = new Set(this.renderingUsers.map(user => user.uuid));
      const newUsers = [];
      for (const user of users) {
        if (!prevUserUUIDS.has(user.uuid)) {
          newUsers.push(user);
        }
      }

      if (newUsers.length > 0) {
        for (const newUser of newUsers) {
          if (newUser.contact_info.email === this.lastSelectedUserEmail) {
            this.urlPointingUUID = newUser.uuid;
          }
        }
      }
    }

    this.renderingUsers = users;
    this.usersLoaded = true;
    this.dataLoaded = this.usersLoaded;
    if (this.dataLoaded) {
      this.onDataLoaded();
    }
  };

  private onDataLoaded = (): void => {
    if (!this.urlPointingUUID) {
      this.setCurrentUser({user: this.renderingUsers[0]});
    } else {
      const foundUser = this.renderingUsers.find(
          user => user.uuid === this.urlPointingUUID);
      if (!foundUser) {
        this.setCurrentUser({
          user: this.renderingUsers[0],
          fromInputChange: false,
          shouldSetLastUser: true
        });
      } else {
        this.setCurrentUser({
          user: foundUser,
          fromInputChange: false,
          shouldSetLastUser: true
        });
      }
    }
  };

  private getSelectedRoles = (user: User): string[] => {
    if (!user) {
      return [];
    }

    return Object.entries(user.has_roles)
        .filter(([, selected]) => selected)
        .map(([role]) => role);
  };

  private setWorkingPropertyByKey = (key: string, val: any): void => {
    const info = this.nameToPropertyMap[key];
    const splits = info.key.split('.');
    let objInQuestion = this.workingUser;
    for (let i = 0; i < splits.length - 1; i++) {
      objInQuestion = objInQuestion[splits[i]];
    }
    if (info.type === 'date') {
      val = Date.parse(val.value);
      this.canSave = true;
    } else if (info.type === 'permissions') {
      const permissions = this.workingUser.has_permissions;
      for (const permission of Object.keys(permissions)) {
        if (val.includes(permission)) {
          if (!permissions[permission]) {
            this.canSave = true;
          }
          permissions[permission] = true;
        } else {
          if (permissions[permission]) {
            this.canSave = true;
          }
          permissions[permission] = false;
        }
      }
      val = permissions;
    } else if (info.type === 'roles') {
      const roles = this.workingUser.has_roles;
      for (const role of Object.keys(roles)) {
        if (val.includes(role)) {
          if (!roles[role]) {
            this.canSave = true;
          }
          roles[role] = true;
        } else {
          if (roles[role]) {
            this.canSave = true;
          }
          roles[role] = false;
        }
      }
      val = roles;
    } else {
      this.canSave = true;
    }
    objInQuestion[splits[splits.length - 1]] = val;
  };

}

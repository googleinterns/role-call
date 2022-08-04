/* eslint-disable @typescript-eslint/naming-convention */

import {Location} from '@angular/common';
import {Component, EventEmitter, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {User, UserApi} from '../api/user-api.service';

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
export class UserEditor implements OnInit {
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


  canDelete = false;
  canSave = false;

  creatingUser = false;

  usersLoaded = false;

  private urlPointingUUID: string;

  private prevWorkingState: User | undefined;
  private workingUser: User | undefined;

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
    private readonly userAPI: UserApi,
    private readonly location: Location,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    const uuid: string = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlPointingUUID = uuid;
    }
    this.userAPI.userEmitter.subscribe(user => {
      this.onUserLoad(user);
    });
    this.userAPI.getAllUsers();
  }

  setCurrentUser = ({user, fromInputChange, shouldSetLastUser}: {
    user: User | undefined;
    fromInputChange?: boolean;
    shouldSetLastUser?: boolean;
  }): void => {
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
                           && this.userAPI.isValidUser(renderingUser));
      if (this.prevWorkingState) {
        this.currentSelectedUser = this.prevWorkingState;
        this.renderingUsers.push(this.currentSelectedUser);
      }
      this.prevWorkingState = undefined;
      this.workingUser = undefined;
    }

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

  addUser = (): void => {
    if (this.creatingUser) {
      return;
    }
    this.creatingUser = true;
    this.canSave = true;
    this.prevWorkingState = undefined;
    const newUser: User = {
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
          email: ''
        }
      },
      knows_positions: [],
      uuid: 'newUser:' + Date.now()
    };
    this.currentSelectedUser = newUser;
    this.renderingUsers.push(newUser);
    this.workingUser = newUser;
    this.setCurrentUser({user: this.workingUser});
  };

  deleteUser = (): void => {
    this.prevWorkingState = undefined;
    this.renderingUsers = this.renderingUsers.filter(
        user => user.uuid !== this.currentSelectedUser.uuid);

    if (!this.creatingUser) {
      this.userAPI.deleteUser(this.currentSelectedUser);
    }
    if (this.renderingUsers.length > 0) {
      this.setCurrentUser({user: this.renderingUsers[0]});
    } else {
      this.setCurrentUser({user: undefined});
    }
  };

  saveUser = (): void => {
    this.lastSelectedUserEmail = this.workingUser.contact_info.email;

    this.userAPI.setUser(this.workingUser).then(async result => {
      if (result.successful) {
        this.creatingUser = false;
        this.canDelete = true;
        this.canSave = false;
        const prevUUID = this.workingUser.uuid;
        this.prevWorkingState = undefined;
        this.workingUser = undefined;
        await this.userAPI.getAllUsers();
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

    if (!this.workingUser) {
      this.prevWorkingState =
          JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.workingUser = JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.setCurrentUser({user: this.workingUser, fromInputChange: true});
    }

    if (this.workingUser) {
      this.setWorkingPropertyByKey(valueName, value);
    }
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

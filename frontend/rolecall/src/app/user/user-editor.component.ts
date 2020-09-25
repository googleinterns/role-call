import {Location} from '@angular/common';
import {Component, EventEmitter, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {User, UserApi} from '../api/user_api.service';

/**
 * The view for the User Editor, allowing users to create other users
 * and view user information.
 */
@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditor implements OnInit {
  permissionsSet: EventEmitter<string[]> = new EventEmitter();
  rolesSet: EventEmitter<string[]> = new EventEmitter();

  currentSelectedUser: User;
  renderingUsers: User[];
  urlPointingUUID: string;

  prevWorkingState: User | undefined;
  workingUser: User | undefined;
  disableSave = true;
  creatingUser = false;

  usersLoaded = false;
  dataLoaded = false;

  lastSelectedUserEmail: string;

  nameToPropertyMap = {
    'First Name': {
      key: 'first_name',
      type: 'string'
    },
    'Last Name': {
      key: 'last_name',
      type: 'string'
    },
    Email: {
      key: 'contact_info.email',
      type: 'string'
    },
    'Date Joined': {
      key: 'date_joined',
      type: 'date'
    },
    Phone: {
      key: 'contact_info.phone_number',
      type: 'string'
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
  rolesNamesMap = {
    isAdmin: 'Is Admin',
    isCoreographer: 'Is Coreographer',
    isDancer: 'Is Dancer',
    isOther: 'Is Other',
  };
  permissionsNamesMap = {
    canLogin: 'Can Login',
    canReceiveNotifications: 'Receives Notifications',
    managePerformances: 'Manages Performances',
    manageCasts: 'Manages Casts',
    managePieces: 'Manages Pieces',
    manageRoles: 'Manages Roles',
    manageRules: 'Manages Rules',
  };

  private currentDate = Date.now();

  constructor(
      private route: ActivatedRoute,
      private userAPI: UserApi,
      private location: Location) {
  }

  ngOnInit(): void {
    const uuid: string = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlPointingUUID = uuid;
    }
    this.userAPI.userEmitter.subscribe((user) => {
      this.onUserLoad(user);
    });
    this.userAPI.getAllUsers();
  }

  onUserLoad(users: User[]) {
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
  }

  onDataLoaded() {
    if (!this.urlPointingUUID) {
      this.setCurrentUser(this.renderingUsers[0]);
    } else {
      const foundUser = this.renderingUsers.find(
          (user) => user.uuid === this.urlPointingUUID);
      if (!foundUser) {
        this.setCurrentUser(this.renderingUsers[0], false, true);
      } else {
        this.setCurrentUser(foundUser, false, true);
      }
    }
  }

  setCurrentUser(
      user: User | undefined,
      fromInputChange?: boolean,
      shouldSetLastUser?: boolean) {
    if (shouldSetLastUser) {
      this.lastSelectedUserEmail = user.contact_info.email;
    }

    if (user && this.currentSelectedUser && user.uuid
        !== this.currentSelectedUser.uuid) {
      this.creatingUser = false;
      this.disableSave = true;
    }

    if (this.workingUser && user.uuid !== this.workingUser.uuid) {
      this.renderingUsers = this.renderingUsers.filter(
          (renderingUser) => renderingUser.uuid !== this.workingUser.uuid
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
    this.renderingUsers.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
  }

  addUser() {
    if (this.creatingUser) {
      return;
    }
    this.creatingUser = true;
    this.disableSave = false;
    this.prevWorkingState = undefined;
    const newUser: User = {
      first_name: undefined,
      last_name: undefined,
      has_roles: {
        isAdmin: false,
        isCoreographer: false,
        isDancer: false,
        isOther: false,
      },
      has_permissions: {
        canLogin: true,
        canReceiveNotifications: true,
        managePerformances: false,
        manageCasts: false,
        managePieces: false,
        manageRoles: false,
        manageRules: false
      },
      date_joined: Date.now(),
      contact_info: {
        phone_number: undefined,
        email: undefined,
        emergency_contact: {
          name: undefined,
          phone_number: undefined,
          email: undefined
        }
      },
      knows_positions: [],
      uuid: 'newUser:' + Date.now()
    };
    this.currentSelectedUser = newUser;
    this.renderingUsers.push(newUser);
    this.workingUser = newUser;
    this.setCurrentUser(this.workingUser);
  }

  deleteUser() {
    this.prevWorkingState = undefined;
    this.renderingUsers = this.renderingUsers.filter(
        user => user.uuid !== this.currentSelectedUser.uuid);

    if (!this.creatingUser) {
      this.userAPI.deleteUser(this.currentSelectedUser);
    }

    this.renderingUsers.length > 0 ?
        this.setCurrentUser(this.renderingUsers[0]) :
        this.setCurrentUser(undefined);
  }

  onSaveUser() {
    this.lastSelectedUserEmail = this.workingUser.contact_info.email;

    this.userAPI.setUser(this.workingUser).then(async result => {
      if (result.successful) {
        this.creatingUser = false;
        this.disableSave = true;
        const prevUUID = this.workingUser.uuid;
        this.prevWorkingState = undefined;
        this.workingUser = undefined;
        await this.userAPI.getAllUsers();
        const foundSame = this.renderingUsers.find(
            user => user.uuid === prevUUID);

        if (foundSame && this.location.path().startsWith('user')) {
          this.setCurrentUser(foundSame);
        }
      }
    });
  }

  getCurrentDate() {
    return this.currentDate;
  }

  getAllRoles() {
    return Object.entries(this.rolesNamesMap).map((role) => role[0]);
  }

  getSelectedRoles(user: User) {
    if (!user) {
      return [];
    }

    return Object.entries(user.has_roles)
        .filter((role) => role[1])
        .map((role) => role[0]);
  }

  getAllPermissions() {
    return Object.entries(this.permissionsNamesMap)
        .map((permission) => permission[0]);
  }

  getSelectedPermissions(user: User) {
    if (!user) {
      return [];
    }
    return Object.entries(user.has_permissions)
        .filter((permission) => permission[1])
        .map((permission) => permission[0]);
  }

  onInputChange(change: [string, any]) {
    const valueName = change[0];
    const value = change[1];

    if (!this.workingUser) {
      this.prevWorkingState =
          JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.workingUser = JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.setCurrentUser(this.workingUser, true);
    }

    if (this.workingUser) {
      this.setWorkingPropertyByKey(valueName, value);
    }
  }

  setWorkingPropertyByKey(key: string, val: any) {
    const info = this.nameToPropertyMap[key];
    const splits = info.key.split('.');
    let objInQuestion = this.workingUser;
    for (let i = 0; i < splits.length - 1; i++) {
      objInQuestion = objInQuestion[splits[i]];
    }
    if (info.type === 'date') {
      const date = Date.parse(val.value);
      val = date;
      this.disableSave = false;
    } else if (info.type === 'permissions') {
      const permissions = this.workingUser.has_permissions;
      for (const entry of Object.entries(permissions)) {
        if (val.includes(entry[0])) {
          if (!permissions[entry[0]]) {
            this.disableSave = false;
          }
          permissions[entry[0]] = true;
        } else {
          if (permissions[entry[0]]) {
            this.disableSave = false;
          }
          permissions[entry[0]] = false;
        }
      }
      val = permissions;
    } else if (info.type === 'roles') {
      const roles = this.workingUser.has_roles;
      for (const entry of Object.entries(roles)) {
        if (val.includes(entry[0])) {
          if (!roles[entry[0]]) {
            this.disableSave = false;
          }
          roles[entry[0]] = true;
        } else {
          if (roles[entry[0]]) {
            this.disableSave = false;
          }
          roles[entry[0]] = false;
        }
      }
      val = roles;
    } else {
      this.disableSave = false;
    }
    objInQuestion[splits[splits.length - 1]] = val;
  }
}

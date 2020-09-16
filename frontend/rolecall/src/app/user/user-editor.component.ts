import { Location, KeyValue } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { User, UserApi } from '../api/user_api.service';


/**
 * The view for the User Editor, allowing users to create other users
 * and view user information
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
  su: User[]; // Sorted Users
  urlPointingUUID: string;

  prevWorkingState: User;
  workingUser: User;
  disableSave: boolean = true;
  creatingUser: boolean = false;

  usersLoaded: boolean = false;
  dataLoaded: boolean = false;

  lastSelectedUserEmail: string;

  constructor(private route: ActivatedRoute, private userAPI: UserApi,
    private location: Location) { }

  ngOnInit(): void {
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.urlPointingUUID = uuid;
    }
    this.userAPI.userEmitter.subscribe((val) => { this.onUserLoad(val) });
    this.userAPI.getAllUsers();
  }

  onUserLoad(users: User[]) {
    if (users.length == 0) {
      this.renderingUsers = [];
      return;
    }
    if (this.renderingUsers) {
      let prevUserUUIDS = new Set(this.renderingUsers.map(user => user.uuid));
      let newUsers = [];
      for (let user of users) {
        if (!prevUserUUIDS.has(user.uuid)) {
          newUsers.push(user);
        }
      }
      if (newUsers.length > 0) {
        for (let newUser of newUsers) {
          if (newUser.contact_info.email == this.lastSelectedUserEmail) {
            this.urlPointingUUID = newUser.uuid;
          }
        }
      }
    }
    this.renderingUsers = users;
    this.usersLoaded = true;
    this.dataLoaded = this.usersLoaded;
    if (this.dataLoaded) {
      this.onDataLoaded()
    }
  }

  onDataLoaded() {
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentUser(this.renderingUsers[0]);
    } else {
      let foundUser = this.renderingUsers.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(foundUser)) {
        this.setCurrentUser(this.renderingUsers[0], false, true);
      } else {
        this.setCurrentUser(foundUser, false, true);
      }
    }
  }

  setCurrentUser(user: User, fromInputChange?: boolean, shouldSetLastUser?: boolean) {
    if (shouldSetLastUser) {
      this.lastSelectedUserEmail = user.contact_info.email;
    }
    if (user && this.currentSelectedUser && user.uuid !== this.currentSelectedUser.uuid) {
      this.creatingUser = false;
      this.disableSave = true;
    }
    if (this.workingUser && user.uuid != this.workingUser.uuid) {
      this.renderingUsers = this.renderingUsers.filter(val => val.uuid != this.workingUser.uuid && this.userAPI.isValidUser(val));
      if (this.prevWorkingState != undefined) {
        this.currentSelectedUser = this.prevWorkingState;
        this.renderingUsers.push(this.currentSelectedUser);
      }
      this.prevWorkingState = undefined;
      this.workingUser = undefined;
    }
    this.currentSelectedUser = user;
    if ((isNullOrUndefined(fromInputChange) || !fromInputChange)) {
      if (!this.currentSelectedUser) {
        this.rolesSet.emit([]);
        this.permissionsSet.emit([]);
      } else {
        this.rolesSet.emit(this.getSelectedRoles(this.currentSelectedUser));
        this.permissionsSet.emit(this.getSelectedPermissions(this.currentSelectedUser));
      }
    }
    if (this.location.path().startsWith("/user") || this.location.path().startsWith("/user/")) {
      this.location.replaceState("/user/" + user.uuid);
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
    let newUser: User = {
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
        notifications: true,
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
      uuid: "newUser:" + Date.now()
    }
    this.currentSelectedUser = newUser;
    this.renderingUsers.push(newUser);
    this.workingUser = newUser;
    this.setCurrentUser(this.workingUser);
  }

  deleteUser() {
    this.prevWorkingState = undefined;
    this.renderingUsers = this.renderingUsers.filter(val => val.uuid != this.currentSelectedUser.uuid);
    if (!this.creatingUser) {
      this.userAPI.deleteUser(this.currentSelectedUser);
    }
    this.renderingUsers.length > 0 ? this.setCurrentUser(this.renderingUsers[0]) : this.setCurrentUser(undefined);
  }

  onSaveUser() {
    this.lastSelectedUserEmail = this.workingUser.contact_info.email;
    this.userAPI.setUser(this.workingUser).then(async val => {
      if (val.successful) {
        this.creatingUser = false;
        this.disableSave = true;
        let prevUUID = this.workingUser.uuid;
        this.prevWorkingState = undefined;
        this.workingUser = undefined;
        await this.userAPI.getAllUsers();
        let foundSame = this.renderingUsers.find(val => val.uuid == prevUUID);
        if (foundSame && this.location.path().startsWith('user')) {
          this.setCurrentUser(foundSame);
        }
      }
    });
  }

  nameToPropertyMap = {
    "First Name": {
      key: "first_name",
      type: "string"
    },
    "Last Name": {
      key: "last_name",
      type: "string"
    },
    "Email": {
      key: "contact_info.email",
      type: "string"
    },
    "Date Joined": {
      key: "date_joined",
      type: "date"
    },
    "Phone": {
      key: "contact_info.phone_number",
      type: "string"
    },
    "Roles": {
      key: "has_roles",
      type: "roles"
    },
    "Permissions": {
      key: "has_permissions",
      type: "permissions"
    },
  }

  private currentDate = Date.now();

  getCurrentDate() {
    return this.currentDate;
  }

  rolesNamesMap = {
    isAdmin: "Is Admin",
    isCoreographer: "Is Coreographer",
    isDancer: "Is Dancer",
    isOther: "Is Other",
  }

  permissionsNamesMap = {
    canLogin: "Can Login",
    notifications: "Receives Notifications",
    managePerformances: "Manages Performances",
    manageCasts: "Manages Casts",
    managePieces: "Manages Pieces",
    manageRoles: "Manages Roles",
    manageRules: "Manages Rules",
  }

  getAllRoles() {
    return Object.entries(this.rolesNamesMap).map((val) => val[0]);
  }

  getSelectedRoles(user: User) {
    if (!user) {
      return [];
    }
    return Object.entries(user.has_roles).filter((val) => {
      return val[1];
    }).map((val) => val[0]);
  }

  getAllPermissions() {
    return Object.entries(this.permissionsNamesMap).map((val) => val[0]);
  }

  getSelectedPermissions(user: User) {
    if (!user) {
      return [];
    }
    return Object.entries(user.has_permissions).filter((val) => {
      return val[1];
    }).map((val) => val[0]);
  }

  onInputChange(change: [string, any]) {
    let valueName = change[0];
    let value = change[1];
    if (!this.workingUser) {
      this.prevWorkingState = JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.workingUser = JSON.parse(JSON.stringify(this.currentSelectedUser));
      this.setCurrentUser(this.workingUser, true);
    }
    if (this.workingUser) {
      this.setWorkingPropertyByKey(valueName, value);
    }
  }

  setWorkingPropertyByKey(key: string, val: any) {
    let info = this.nameToPropertyMap[key];
    let splits = info.key.split(".");
    let objInQuestion = this.workingUser;
    for (let i = 0; i < splits.length - 1; i++) {
      objInQuestion = objInQuestion[splits[i]];
    }
    if (info.type == "date") {
      let date = Date.parse(val.value);
      val = date;
      this.disableSave = false;
    }
    else if (info.type == "permissions") {
      let val2 = this.workingUser.has_permissions;
      for (let entry of Object.entries(val2)) {
        if (val.includes(entry[0])) {
          if (!val2[entry[0]]) {
            this.disableSave = false;
          }
          val2[entry[0]] = true;
        } else {
          if (val2[entry[0]]) {
            this.disableSave = false;
          }
          val2[entry[0]] = false;
        }
      }
      val = val2;
    } else if (info.type == "roles") {
      let val2 = this.workingUser.has_roles;
      for (let entry of Object.entries(val2)) {
        if (val.includes(entry[0])) {
          if (!val2[entry[0]]) {
            this.disableSave = false;
          }
          val2[entry[0]] = true;
        } else {
          if (val2[entry[0]]) {
            this.disableSave = false;
          }
          val2[entry[0]] = false;
        }
      }
      val = val2;
    }
    else {
      this.disableSave = false;
    }
    objInQuestion[splits[splits.length - 1]] = val;
  }
}

import { Location } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { PrivilegeClassApi } from '../api/privilege_class_api.service';
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
export class UserEditor implements OnInit, OnDestroy {

  permissionsSet: EventEmitter<string[]> = new EventEmitter();
  privilegeClassSet: EventEmitter<string[]> = new EventEmitter();

  currentSelectedUser: User;
  renderingUsers: User[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: User;
  workingUser: User;
  userSaved: boolean = false;
  creatingUser: boolean = false;

  constructor(private route: ActivatedRoute, private userAPI: UserApi,
    private privilegeClassAPI: PrivilegeClassApi,
    private location: Location) { }

  ngOnInit(): void {
    let uuid = this.route.snapshot.params.uuid;
    if (!isNullOrUndefined(uuid)) {
      this.urlPointingUUID = uuid;
    }
    this.userAPI.userEmitter.subscribe((val) => { this.onUserLoad(val) });
    this.userAPI.getAllUsers();
    this.privilegeClassAPI.privilegeClassEmitter.subscribe(val => {
      this.onPrivilegeClassLoad(val);
    });
    this.privilegeClassAPI.getAllPrivilegeClasses();
  }

  ngOnDestroy(): void {
    this.userAPI.userEmitter.unsubscribe();
    this.privilegeClassAPI.privilegeClassEmitter.unsubscribe();
  }

  onUserLoad(users: User[]) {
    if (users.length == 0) {
      this.renderingUsers = [];
      return;
    }
    this.renderingUsers = users;
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentUser(users[0]);
    } else {
      let foundUser = users.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(foundUser)) {
        this.setCurrentUser(users[0]);
      } else {
        this.setCurrentUser(foundUser);
      }
    }
  }

  onPrivilegeClassLoad(privilegeClassesIn: string[]) {
    this.privilegeClasses = privilegeClassesIn;
  }

  setCurrentUser(user: User, fromInputChange?: boolean) {
    if (user && this.currentSelectedUser && user.uuid !== this.currentSelectedUser.uuid) {
      this.userSaved = false;
      this.creatingUser = false;
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
    if (isNullOrUndefined(fromInputChange) || !fromInputChange) {
      this.permissionsSet.emit(this.getSelectedPerms(this.currentSelectedUser));
      this.privilegeClassSet.emit(this.currentSelectedUser.has_privilege_classes ? this.currentSelectedUser.has_privilege_classes : []);
    }
    if (this.location.path().endsWith("user") || this.location.path().endsWith("user/")) {
      this.location.replaceState(this.location.path() + "/" + user.uuid);
    } else {
      let splits: string[] = this.location.path().split('/');
      let baseURL = "";
      for (let i = 0; i < splits.length - 1; i++) {
        baseURL += (splits[i] + "/");
      }
      this.location.replaceState(baseURL + user.uuid);
    }
    this.urlPointingUUID = user.uuid;
    this.renderingUsers.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
  }

  addUser() {
    if (this.creatingUser) {
      return;
    }
    this.creatingUser = true;
    this.prevWorkingState = undefined;
    let newUser: User = {
      first_name: undefined,
      last_name: undefined,
      has_permissions: {
        canLogin: false,
        isAdmin: false,
        notifications: false,
        managePerformances: false,
        manageCasts: false,
        managePieces: false,
        manageRoles: false,
        manageRules: false
      },
      date_of_birth: 0,
      has_privilege_classes: [],
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
    this.userAPI.deleteUser(this.currentSelectedUser);
    this.renderingUsers.length > 0 ? this.setCurrentUser(this.renderingUsers[0]) : this.setCurrentUser(undefined);
  }

  onSaveUser() {
    this.userAPI.setUser(this.workingUser).then(async val => {
      if (val.successful) {
        this.creatingUser = false;
        this.userSaved = true;
        let prevUUID = this.workingUser.uuid;
        this.prevWorkingState = undefined;
        this.workingUser = undefined;
        await this.userAPI.getAllUsers();
        let foundSame = this.renderingUsers.find(val => val.uuid == prevUUID);
        if (foundSame) {
          this.setCurrentUser(foundSame);
        }
      } else {
        alert("User missing necessary information!");
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
    "Date of Birth": {
      key: "date_of_birth",
      type: "date"
    },
    "Email": {
      key: "contact_info.email",
      type: "string"
    },
    "Permissions": {
      key: "has_permissions",
      type: "permissions"
    },
    "Phone": {
      key: "contact_info.phone_number",
      type: "string"
    },
    "Privilege Classes": {
      key: "has_privilege_classes",
      type: "string list"
    }
  }

  private currentDate = Date.now();

  getCurrentDate() {
    return this.currentDate;
  }

  permsNamesMap = {
    canLogin: "Can Login",
    isAdmin: "Is Admin",
    notifications: "Receives Notifications",
    managePerformances: "Manages Performances",
    manageCasts: "Manages Casts",
    managePieces: "Manages Pieces",
    manageRoles: "Manages Roles",
    manageRules: "Manages Rules"
  }

  getAllPerms() {
    return Object.entries(this.permsNamesMap).map((val) => val[0]);
  }

  getSelectedPerms(user: User) {
    if (!user)
      return [];
    return Object.entries(user.has_permissions).filter((val) => {
      return val[1];
    }).map((val) => val[0]);
  }

  onInputChange(change: [string, any]) {
    console.log(change);
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
    }
    if (info.type == "permissions") {
      let val2 = this.workingUser.has_permissions;
      for (let entry of Object.entries(val2)) {
        if (val.includes(entry[0])) {
          val2[entry[0]] = true;
        } else {
          val2[entry[0]] = false;
        }
      }
      val = val2;
    }
    objInQuestion[splits[splits.length - 1]] = val;
  }


}

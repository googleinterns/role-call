import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { PrivilegeClassApi } from '../api/privilege_class_api.service';
import { User, UserApi } from '../api/user_api.service';
import { HelpModalService } from '../app/help/help_modal.service';

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
  privilegeClassSet: EventEmitter<string[]> = new EventEmitter();

  currentSelectedUser: User;
  renderingUsers: User[];
  urlPointingUUID: string;

  privilegeClasses: string[] = [];

  prevWorkingState: User;
  workingUser: User;
  userSaved: boolean = true;
  creatingUser: boolean = false;

  usersLoaded: boolean = false;
  privilegeClassesLoaded: boolean = false;
  dataLoaded: boolean = false;

  lastSelectedUserEmail: string;

  constructor(private route: ActivatedRoute, private userAPI: UserApi,
    private privilegeClassAPI: PrivilegeClassApi,
    private location: Location, private dialogService: HelpModalService) { }
  

  //Modal Text
  openDialog(): void {
    const options = {
      title: 'Users Page',
      sections: ["Creating a New User", "Opening a User's Information Page", "Deleting a User"],
      messages: [`Press the plus button at the bottom left of the page to open a new user information page.
      Click on a field to input information for the new user. The permissions/priviledge fields will open a dropdown
      menu when clicked. Just select which classes/permissions you wish to give the user and click out of the dropdown menu when done.
      When you are satisfied with the new user's information, press the save button at the bottom right to add the new user to the
      users section.`,
      `Click on the user's name on the left panel to open the user's 
      information page. You can modify the user's information/priviledges just as you would when creating a new user.`,
      `Click the "delete" button at the bottom left of the user's information page to delete a user.`
    ],
      confirmText: 'Exit',
    };
    this.dialogService.open(options);
  } 

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
            this.lastSelectedUserEmail == newUser.contact_info.email;
            this.urlPointingUUID = newUser.uuid;
          }
        }
      }
    }
    this.renderingUsers = users;
    this.usersLoaded = true;
    this.dataLoaded = this.usersLoaded && this.privilegeClassesLoaded;
    if (this.dataLoaded)
      this.onDataLoaded()
  }

  onDataLoaded() {
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentUser(this.renderingUsers[0]);
    } else {
      let foundUser = this.renderingUsers.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(foundUser)) {
        // if (!isNullOrUndefined(this.lastSelectedUserUUID)) {
        //   let foundUser2 = this.renderingUsers.find((val) => val.uuid == this.lastSelectedUserUUID);
        //   this.setCurrentUser(foundUser2);
        // } else {
        this.setCurrentUser(this.renderingUsers[0], false, true);
        // }
      } else {
        this.setCurrentUser(foundUser, false, true);
      }
    }
  }
  onPrivilegeClassLoad(privilegeClassesIn: string[]) {
    this.privilegeClasses = privilegeClassesIn;
    this.privilegeClassesLoaded = true;
    this.dataLoaded = this.usersLoaded && this.privilegeClassesLoaded;
    if (this.dataLoaded)
      this.onDataLoaded()
  }

  setCurrentUser(user: User, fromInputChange?: boolean, shouldSetLastUser?: boolean) {
    if (shouldSetLastUser) {
      this.lastSelectedUserEmail == user.contact_info.email;
    }
    if (user && this.currentSelectedUser && user.uuid !== this.currentSelectedUser.uuid) {
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
    if ((isNullOrUndefined(fromInputChange) || !fromInputChange)) {
      if (!this.currentSelectedUser) {
        this.permissionsSet.emit([]);
        this.privilegeClassSet.emit([]);
      } else {
        this.permissionsSet.emit(this.getSelectedPerms(this.currentSelectedUser));
        this.privilegeClassSet.emit(this.currentSelectedUser.has_privilege_classes ? this.currentSelectedUser.has_privilege_classes : []);
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
    this.userSaved = false;
    this.prevWorkingState = undefined;
    let newUser: User = {
      first_name: undefined,
      last_name: undefined,
      has_permissions: {
        canLogin: true,
        isAdmin: false,
        notifications: true,
        managePerformances: false,
        manageCasts: false,
        managePieces: false,
        manageRoles: false,
        manageRules: false
      },
      date_joined: Date.now(),
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
        this.userSaved = true;
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
    "Date Joined": {
      key: "date_joined",
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
      this.userSaved = false;
    }
    else if (info.type == "permissions") {
      let val2 = this.workingUser.has_permissions;
      for (let entry of Object.entries(val2)) {
        if (val.includes(entry[0])) {
          if (!val2[entry[0]]) {
            this.userSaved = false;
          }
          val2[entry[0]] = true;
        } else {
          if (val2[entry[0]]) {
            this.userSaved = false;
          }
          val2[entry[0]] = false;
        }
      }
      val = val2;
    }
    else if (key == "Privilege Classes") {
      if (this.workingUser.has_privilege_classes) {
        let largerArr = val.length > this.workingUser.has_privilege_classes.length ? val : this.workingUser.has_privilege_classes;
        let smallerArr = val.length <= this.workingUser.has_privilege_classes.length ? val : this.workingUser.has_privilege_classes;
        for (let i = 0; i < largerArr.length; i++) {
          if (largerArr[i] != smallerArr[i]) {
            this.userSaved = false;
            break;
          }
        }
      }
    }
    else {
      this.userSaved = false;
    }
    objInQuestion[splits[splits.length - 1]] = val;
  }


}

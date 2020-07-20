import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { User, UserApi } from '../api/user-api.service';
import { Location } from '@angular/common';
import { EditableTextInput } from '../common_components/editable_text_input.component';


/**
 * The view for the User Editor, allowing users to create other users
 * and view user information
 */
@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnInit, OnDestroy {

  @ViewChild('nameInput') nameInput: EditableTextInput;
  currentSelectedUser: User;
  renderingUsers: User[];
  urlPointingUUID: string;

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

  ngOnDestroy(): void {
    this.userAPI.userEmitter.unsubscribe();
  }

  onUserLoad(users: User[]) {
    if (users.length == 0) {
      this.renderingUsers = [];
      return;
    }
    if (isNullOrUndefined(this.urlPointingUUID)) {
      this.setCurrentUser(users[0]);
    } else {
      this.currentSelectedUser = users.find((val) => val.uuid == this.urlPointingUUID);
      if (isNullOrUndefined(this.currentSelectedUser)) {
        this.setCurrentUser(users[0]);
      }
    }
    users.push(...users);
    users.push(...users);
    users.push(...users);
    users.push(...users);
    this.renderingUsers = users;
  }

  setCurrentUser(user: User) {
    this.currentSelectedUser = user;
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
  }

  addUser() { }

  onTextInputChange(change: [string, string]) {
    let valueName = change[0];
    let value = change[1];
    console.log(valueName, value);
  }


}

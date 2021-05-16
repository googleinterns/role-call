import {Component, OnInit} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatSelectChange} from '@angular/material/select';
import {Unavailability, UnavailabilityApi} from '../api/unavailability-api.service';
import {User, UserApi} from '../api/user_api.service';

type ProcessedUnav = {
  unav: Unavailability,
  user: User,
  fromDateStr: string,
  toDateStr: string
};

@Component({
  selector: 'app-unavailability-editor',
  templateUrl: './unavailability-editor.component.html',
  styleUrls: ['./unavailability-editor.component.scss']
})
export class UnavailabilityEditor implements OnInit {

  currentUnavailabilities: Unavailability[] = [];
  pastUnavailabilities: Unavailability[] = [];
  processedCurrUnavs: ProcessedUnav[] = [];
  processedPastUnavs: ProcessedUnav[] = [];
  isEditingPrevious = false;
  state: Unavailability;

  selectedUser: User;
  startDate: Date;
  endDate: Date;
  canSave = false;

  allUsers: User[];
  dataLoaded = false;
  unavsLoaded = false;
  usersLoaded = false;

  constructor(private unavAPI: UnavailabilityApi, private userAPI: UserApi) {
  }

  ngOnInit(): void {
    this.state = this.createNewUnavailability();
    this.unavAPI.unavailabilityEmitter.subscribe(val => this.onUnavsLoad(val));
    this.userAPI.userEmitter.subscribe(val => this.onUsersLoad(val));
    this.unavAPI.getAllUnavailabilities();
    this.userAPI.getAllUsers();
  }

  onUnavsLoad(unavs: Unavailability[]) {
    const dateOldToNewComp = (a: Unavailability, b: Unavailability) => {
      return a.startDate - b.startDate;
    };
    const dateNewToOldComp = (a: Unavailability, b: Unavailability) => {
      return b.startDate - a.startDate;
    };
    const now = Date.now();
    this.currentUnavailabilities =
        unavs.filter(ua => ua.endDate > now).sort(dateOldToNewComp);
    this.pastUnavailabilities =
        unavs.filter(ua => ua.endDate <= now).sort(dateNewToOldComp);
    this.unavsLoaded = true;
    this.checkDataLoaded();
  }

  onUsersLoad(users: User[]) {
    this.allUsers = users.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
    this.usersLoaded = true;
    this.checkDataLoaded();
  }

  checkDataLoaded(): boolean {
    this.dataLoaded = this.unavsLoaded && this.usersLoaded;
    if (this.dataLoaded) {
      this.afterAllDataLoaded();
    }
    return this.dataLoaded;
  }

  afterAllDataLoaded() {
    this.processedCurrUnavs = this.currentUnavailabilities.map(ua => {
      return {
        unav: ua,
        user: this.userAPI.users.get(String(ua.userId)),
        fromDateStr: new Date(ua.startDate).toLocaleDateString('en-US'),
        toDateStr: new Date(ua.endDate).toLocaleDateString('en-US')
      };
    });
    this.processedPastUnavs = this.pastUnavailabilities.map(ua => {
      return {
        unav: ua,
        user: this.userAPI.users.get(String(ua.userId)),
        fromDateStr: new Date(ua.startDate).toLocaleDateString('en-US'),
        toDateStr: new Date(ua.endDate).toLocaleDateString('en-US')
      };
    });
  }

  createNewUnavailability(): Unavailability {
    return {
      id: Date.now(),
      description: '',
      userId: undefined,
      startDate: Date.now(),
      endDate: Date.now()
    };
  }

  updateCanSave() {
    this.canSave = (!!this.startDate
                    && !!this.endDate
                    && !!this.selectedUser);
  }

  resetCompState() {
    this.selectedUser = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.updateCanSave();
  }

  onSelectUser(event: MatSelectChange) {
    this.state.userId = Number(event.value.uuid);
    this.selectedUser = event.value;
    this.updateCanSave();
  }

  onFromDateChange(event: MatDatepickerInputEvent<Date>) {
    this.state.startDate = event.value.getTime();
    this.updateCanSave();
  }

  onToDateChange(event: MatDatepickerInputEvent<Date>) {
    this.state.endDate = event.value.getTime();
    this.updateCanSave();
  }

  onDescChange(event) {
    this.state.description = event.target.value;
  }

  onNewUnav() {
    this.isEditingPrevious = false;
    this.state = this.createNewUnavailability();
    this.resetCompState();
  }

  onEditUnav(unav: Unavailability) {
    this.resetCompState();
    this.isEditingPrevious = true;
    this.state = JSON.parse(JSON.stringify(unav));
    this.selectedUser = this.userAPI.users.get(String(this.state.userId));
    this.startDate = new Date(unav.startDate);
    this.endDate = new Date(unav.endDate);
    this.updateCanSave();
  }

  onSaveUnav() {
    this.doSetUnav().then(() => {
      this.onNewUnav();
    });
  }

  onDeleteUnav(ua: Unavailability) {
    this.doDeleteUnav(ua);
  }

  doSetUnav() {
    return this.unavAPI.setUnavailability(this.state);
  }

  doDeleteUnav(ua: Unavailability) {
    return this.unavAPI.deleteUnavailability(ua);
  }

}

import {Component, OnInit} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatSelectChange} from '@angular/material/select';
import {Unavailability, UnavailabilityApi,
} from '../api/unavailability-api.service';
import {User, UserApi} from '../api/user_api.service';
import * as APITypes from 'src/api_types';

type ProcessedUnav = {
  unav: Unavailability;
  user: User;
  fromDateStr: string;
  toDateStr: string;
};

@Component({
  selector: 'app-unavailability-editor',
  templateUrl: './unavailability-editor.component.html',
  styleUrls: ['./unavailability-editor.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
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

  constructor(
    private unavAPI: UnavailabilityApi,
    private userAPI: UserApi,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.state = this.createNewUnavailability();
    this.unavAPI.unavailabilityEmitter.subscribe(val => this.onUnavsLoad(val));
    this.userAPI.userEmitter.subscribe(val => this.onUsersLoad(val));
    this.unavAPI.getAllUnavailabilities();
    this.userAPI.getAllUsers();
  }

  onUnavsLoad = (unavs: Unavailability[]): void => {
    const dateOldToNewComp = (
      a: Unavailability, b: Unavailability): number =>
      a.startDate - b.startDate;

    const dateNewToOldComp = (
      a: Unavailability, b: Unavailability): number =>
      b.startDate - a.startDate;

    const now = Date.now();
    this.currentUnavailabilities =
        unavs.filter(ua => ua.endDate > now).sort(dateOldToNewComp);
    this.pastUnavailabilities =
        unavs.filter(ua => ua.endDate <= now).sort(dateNewToOldComp);
    this.unavsLoaded = true;
    this.checkDataLoaded();
  };

  onUsersLoad = (users: User[]): void => {
    this.allUsers = users.sort((a, b) => a.last_name < b.last_name ? -1 : 1);
    this.usersLoaded = true;
    this.checkDataLoaded();
  };

  checkDataLoaded = (): boolean => {
    this.dataLoaded = this.unavsLoaded && this.usersLoaded;
    if (this.dataLoaded) {
      this.afterAllDataLoaded();
    }
    return this.dataLoaded;
  };

  afterAllDataLoaded = (): void => {
    this.processedCurrUnavs = this.currentUnavailabilities.map(ua => ({
        unav: ua,
        user: this.userAPI.users.get(String(ua.userId)),
        fromDateStr: new Date(ua.startDate).toLocaleDateString('en-US'),
        toDateStr: new Date(ua.endDate).toLocaleDateString('en-US')
      })
    );
    this.processedPastUnavs = this.pastUnavailabilities.map(ua => ({
        unav: ua,
        user: this.userAPI.users.get(String(ua.userId)),
        fromDateStr: new Date(ua.startDate).toLocaleDateString('en-US'),
        toDateStr: new Date(ua.endDate).toLocaleDateString('en-US')
      })
    );
  };

  createNewUnavailability = (): Unavailability => ({
      id: Date.now(),
      description: '',
      userId: undefined,
      startDate: Date.now(),
      endDate: Date.now()
    });


  updateCanSave = (): void => {
    this.canSave = (!!this.startDate
      && !!this.endDate
      && !!this.selectedUser);
  };

  resetCompState = (): void => {
    this.selectedUser = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.updateCanSave();
  };

  onSelectUser = (event: MatSelectChange): void => {
    this.state.userId = Number(event.value.uuid);
    this.selectedUser = event.value;
    this.updateCanSave();
  };

  onFromDateChange = (event: MatDatepickerInputEvent<Date>): void => {
    this.state.startDate = event.value.getTime();
    this.updateCanSave();
  };

  onToDateChange = (event: MatDatepickerInputEvent<Date>): void => {
    this.state.endDate = event.value.getTime();
    this.updateCanSave();
  };

  onDescChange = (event: Event): void => {
    this.state.description = ( event.target as HTMLInputElement ).value;
  };

  onNewUnav = (): void => {
    this.isEditingPrevious = false;
    this.state = this.createNewUnavailability();
    this.resetCompState();
  };

  onEditUnav = (unav: Unavailability): void => {
    this.resetCompState();
    this.isEditingPrevious = true;
    this.state = JSON.parse(JSON.stringify(unav));
    this.selectedUser = this.userAPI.users.get(String(this.state.userId));
    this.startDate = new Date(unav.startDate);
    this.endDate = new Date(unav.endDate);
    this.updateCanSave();
  };

  onSaveUnav = (): void => {
    this.doSetUnav().then(() => {
      this.onNewUnav();
    });
  };

  onDeleteUnav = (ua: Unavailability): void => {
    this.doDeleteUnav(ua);
  };

  doSetUnav = async (): Promise<APITypes.SuccessIndicator> =>
    this.unavAPI.setUnavailability(this.state);


  doDeleteUnav = async (
    ua: Unavailability,
  ): Promise<APITypes.SuccessIndicator> =>
    this.unavAPI.deleteUnavailability(ua);


}

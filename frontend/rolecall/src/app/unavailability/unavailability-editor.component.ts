import {Component, OnInit} from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatSelectChange} from '@angular/material/select';
import {Unavailability, UnavailabilityApi, UnavailabilityReason,
} from '../api/unavailability-api.service';
import {User, UserApi} from '../api/user-api.service';
import * as APITypes from 'src/api-types';


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

  unavs: Unavailability[] = [];
  processedUnavs: ProcessedUnav[] = [];
  state: Unavailability;

  selectedUser: User;
  selectedReason: UnavailabilityReason;
  startDate: Date;
  endDate: Date;
  canSave = false;
  canDelete = false;

  initialSelectedReason = '';

  allUsers: User[];
  dataLoaded = false;
  unavsLoaded = false;
  usersLoaded = false;

  constructor(
    private userAPI: UserApi,

    public unavAPI: UnavailabilityApi,
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

  onUnavsLoad = (
    unavs: Unavailability[],
  ): void => {
    this.unavs = Array.from(unavs).sort((ua, ub) => ua.endDate - ub.endDate)
    this.unavsLoaded = true;
    this.checkDataLoaded();
  };

  onUsersLoad = (
    users: User[],
  ): void => {
    this.allUsers = users.sort((a, b) =>
      a.last_name.toLowerCase() < b.last_name.toLowerCase() ? -1 : 1);
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
    this.processedUnavs = this.unavs.map(ua => ({
        unav: ua,
        user: this.userAPI.users.get(String(ua.userId)),
        fromDateStr: new Date(ua.startDate).toLocaleDateString('en-US'),
        toDateStr: new Date(ua.endDate).toLocaleDateString('en-US')
      })
    );
  };

  createNewUnavailability = (): Unavailability => {
    this.canDelete = false;
    return {
      id: Date.now(),
      reason: 'UNDEF',
      description: '',
      userId: 0,
      startDate: Date.now(),
      endDate: Date.now(),
    };
  };

  updateCanSave = (): void => {
    this.canSave = (
      !!this.startDate
      && !!this.endDate
      && !!this.selectedUser
      && (!!this.selectedReason && this.selectedReason !== 'UNDEF')
    );
  };

  resetCompState = (): void => {
    this.selectedUser = undefined;
    this.selectedReason = 'UNDEF';
    this.startDate = undefined;
    this.endDate = undefined;
    this.updateCanSave();
  };

  onSelectUser = (
    event: MatSelectChange,
  ): void => {
    this.state.userId = Number(event.value.uuid);
    this.selectedUser = event.value;
    this.updateCanSave();
  };

  onSelectReason = (
    event: MatSelectChange,
  ): void => {
    this.selectedReason =
      ( event.value as string ).toUpperCase() as UnavailabilityReason;
    this.state.reason = this.selectedReason;
    this.updateCanSave();
  };

  onFromDateChange = (
    event: MatDatepickerInputEvent<Date>,
  ): void => {
    this.state.startDate = event.value.getTime();
    this.updateCanSave();
  };

  onToDateChange = (
    event: MatDatepickerInputEvent<Date>,
  ): void => {
    this.state.endDate = event.value.getTime();
    this.updateCanSave();
  };

  onDescChange = (
    event: Event,
  ): void => {
    this.state.description = ( event.target as HTMLInputElement ).value;
  };

  onNewUnav = (): void => {
    this.state = this.createNewUnavailability();
    this.initialSelectedReason = '';
    this.resetCompState();
  };

  onEditUnav = (
    unav: Unavailability,
  ): void => {
    this.resetCompState();
    this.state = JSON.parse(JSON.stringify(unav));
    this.selectedUser = this.userAPI.users.get(String(this.state.userId));
    this.selectedReason = unav.reason;
    this.initialSelectedReason = this.makeTypePretty(this.selectedReason);
    this.startDate = new Date(unav.startDate);
    this.endDate = new Date(unav.endDate);
    this.updateCanSave();
    this.canDelete = true;
  };

  onSaveUnav = (): void => {
    this.doSetUnav().then(() => {
      this.onNewUnav();
    });
  };

  onDeleteUnav = (): void => {
    this.doDeleteUnav(this.state);
  };

  doSetUnav = async (): Promise<APITypes.SuccessIndicator> =>
    this.unavAPI.setUnavailability(this.state);


  doDeleteUnav = async (
    ua: Unavailability,
  ): Promise<APITypes.SuccessIndicator> => {
    const success = this.unavAPI.deleteUnavailability(ua);
    this.onNewUnav();
    return success;
  };


  makeTypePretty = (type: UnavailabilityReason): string =>
    !!type ? type.slice(0, 1) + type.slice(1).toLowerCase() : '';


}
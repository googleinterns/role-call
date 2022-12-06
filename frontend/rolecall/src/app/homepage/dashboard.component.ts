import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PerformanceStatus } from 'src/api-types';
import { PerformanceApi, Performance } from '../api/performance-api.service';
import * as APITypes from 'src/api-types';

type WeekdayOptions = 'long' | 'short' | 'narrow';
type YearOptions = 'numeric' | '2-digit';
type MonthOptions = 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';

type DayOptions = 'numeric' | '2-digit';
type HourOptions = 'numeric' | '2-digit';
type MinutesOptions = 'numeric' | '2-digit';

type DataOptions = {
  weekday: WeekdayOptions;
  year: YearOptions;
  month: MonthOptions;
  day: DayOptions;
};

type TimeOptions = {
  hour: HourOptions;
  minute: MinutesOptions;
};

export type DashPerformance = {
  uuid: APITypes.DashUUID;
  title: string;
  description: string;
  location: string;
  dateTime: number;
  status: PerformanceStatus;
};

export type ProcessedDashPerformance = {
  title: string;
  dateStr: string;
  timeStr: string;
  location: string;
  uuid: string;
  routerLink: string;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class Dashboard implements OnInit, OnDestroy {

  allDashPerfs: DashPerformance[];
  upcomingDashPerfs: DashPerformance[];
  pastDashPerfs: DashPerformance[];
  processedUpcomingDashPerfs: ProcessedDashPerformance[] = [];
  processedPastDashPerfs: ProcessedDashPerformance[] = [];
  dashSubscription: Subscription;
  dashPerfsLoaded = false;
  dataLoaded = false;

  constructor(
    private perfApi: PerformanceApi,
  ) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.dashSubscription =
      this.perfApi.cache.loadedAll.subscribe(
        items => this.onDashPerfsLoad(items));
    this.perfApi.loadAllPerformances();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    this.dashSubscription.unsubscribe();
  }

  onDashPerfsLoad = (
    items: unknown[],
  ): void => {
    const performances = items as Performance[];
    this.allDashPerfs = performances.map(perf => {
        const location = this.calcLocation(perf);
        return {
        uuid: perf.uuid,
        title: perf.step_1.title,
        description: perf.step_1.description,
        location,
        dateTime: perf.dateTime,
        status: perf.status,
        // the below line fixes an error in eslint.
        // eslint-disable-next-line @typescript-eslint/semi
      }}).sort((a, b) => a.dateTime - b.dateTime);
    const now = Date.now();
    this.upcomingDashPerfs =
        this.allDashPerfs.filter(val => val.dateTime >= now);
    this.pastDashPerfs = this.allDashPerfs.filter(val => val.dateTime < now);
    const dateOpts = {
      weekday: 'long' as WeekdayOptions,
      year: 'numeric' as YearOptions,
      month: 'long' as MonthOptions,
      day: 'numeric' as DayOptions,
    };
    const timeOpts = {
      hour: 'numeric' as HourOptions,
      minute: '2-digit' as MinutesOptions,
    };
    this.processedUpcomingDashPerfs = this.upcomingDashPerfs.map(perf =>
        this.makeDashPerf(perf, dateOpts, timeOpts));
    this.processedPastDashPerfs = this.pastDashPerfs.sort((a, b) =>
      b.dateTime - a.dateTime
    ).map(perf => this.makeDashPerf(perf, dateOpts, timeOpts));
    this.dashPerfsLoaded = true;
    this.checkDataLoaded();
  };

  refreshData = (): void => {
    this.dashPerfsLoaded = false;
    this.perfApi.loadAllPerformances(true);
  };

  checkDataLoaded = (): boolean => {
    this.dataLoaded = this.dashPerfsLoaded;
    return this.dataLoaded;
  };

  // Private methods

  calcLocation = (perf: Performance): string => {
    const venue = perf.step_1.venue;
    const city = perf.step_1.city;
    return !venue ? city : !city ? venue : `${venue}, ${city}`;
  };

  makeDashPerf = (
    perf: DashPerformance,
    dateOpts: DataOptions,
    timeOpts: TimeOptions,
  ): ProcessedDashPerformance => {
    const date = new Date(perf.dateTime);
    return {
      title: perf.title,
      dateStr: date.toLocaleDateString('en-US', dateOpts),
      timeStr: date.toLocaleTimeString('en-US', timeOpts),
      location: perf.location,
      uuid: perf.uuid,
      routerLink: '/performance/' + perf.uuid,
    };
  };

}

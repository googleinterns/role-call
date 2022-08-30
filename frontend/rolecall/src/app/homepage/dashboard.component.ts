import { Component, OnInit } from '@angular/core';
import { DashboardApi, DashPerformance } from '../api/dashboard-api.service';

type WeekdayOptions = 'long' | 'short' | 'narrow';
type YearOptions = 'numeric' | '2-digit';
type MonthOptions = 'numeric' | '2-digit' | 'long' |
                    'short' | 'narrow';

type DayOptions = 'numeric' | '2-digit';
type HourOptions = 'numeric' | '2-digit';
type MinutesOptions = 'numeric' | '2-digit';

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
export class Dashboard implements OnInit {

  allDashPerfs: DashPerformance[];
  upcomingDashPerfs: DashPerformance[];
  pastDashPerfs: DashPerformance[];
  processedUpcomingDashPerfs: ProcessedDashPerformance[] = [];
  processedPastDashPerfs: ProcessedDashPerformance[] = [];
  dashPerfsLoaded = false;
  dataLoaded = false;

  constructor(private dashAPI: DashboardApi) {
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.dashAPI.dashPerformanceEmitter.subscribe(
        val => this.onDashPerfsLoad(val));
    this.dashAPI.getAllDashboard();
  }

  onDashPerfsLoad = (dashPerfArr: DashPerformance[]): void => {
    this.allDashPerfs = dashPerfArr.sort((a, b) => a.dateTime - b.dateTime);
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
      hour: '2-digit' as HourOptions,
      minute: '2-digit' as MinutesOptions,
    };
    this.processedUpcomingDashPerfs = this.upcomingDashPerfs.map(perf => {
      const date = new Date(perf.dateTime);
      return {
        title: perf.title,
        dateStr: date.toLocaleDateString('en-US', dateOpts),
        timeStr: date.toLocaleTimeString('en-US', timeOpts),
        location: perf.location,
        uuid: String(perf.id),
        routerLink: '/performance/' + perf.id
      };
    });
    this.processedPastDashPerfs = this.pastDashPerfs.sort((a, b) =>
      b.dateTime - a.dateTime
    ).map(perf => {
      const date = new Date(perf.dateTime);
      return {
        title: perf.title,
        dateStr: date.toLocaleDateString('en-US', dateOpts),
        timeStr: date.toLocaleTimeString('en-US', timeOpts),
        location: perf.location,
        uuid: String(perf.id),
        routerLink: '/performance/' + perf.id
      };
    });
    this.dashPerfsLoaded = true;
    this.checkDataLoaded();
  };

  checkDataLoaded = (): boolean => {
    this.dataLoaded = this.dashPerfsLoaded;
    return this.dataLoaded;
  };

}

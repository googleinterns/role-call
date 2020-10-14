import {Component, OnInit} from '@angular/core';
import {DashboardApi, DashPerformance} from '../api/dashboard_api.service';

export type ProcessedDashPerformance = {
  title: string,
  dateStr: string,
  timeStr: string,
  location: string,
  uuid: string,
  routerLink: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class Dashboard implements OnInit {

  allDashPerfs: DashPerformance[];
  upcomingDashPerfs: DashPerformance[];
  pastDashPerfs: DashPerformance[];
  processedUpcomingDashPerfs: ProcessedDashPerformance[] = [];
  processedPastDashPerfs: ProcessedDashPerformance[] = [];
  dashPerfsLoaded: boolean = false;
  dataLoaded: boolean = false;

  constructor(private dashAPI: DashboardApi) {
  }

  ngOnInit(): void {
    this.dashAPI.dashPerformanceEmitter.subscribe(
        val => this.onDashPerfsLoad(val));
    this.dashAPI.getAllDashboard();
  }

  onDashPerfsLoad(dashPerfArr: DashPerformance[]) {
    this.allDashPerfs = dashPerfArr.sort((a, b) => a.dateTime - b.dateTime);
    let now = Date.now();
    this.upcomingDashPerfs =
        this.allDashPerfs.filter(val => val.dateTime >= now);
    this.pastDashPerfs = this.allDashPerfs.filter(val => val.dateTime < now);
    let dateOpts = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    let timeOpts = {hour: '2-digit', minute: '2-digit'};
    this.processedUpcomingDashPerfs = this.upcomingDashPerfs.map(perf => {
      let date = new Date(perf.dateTime);
      return {
        title: perf.title,
        dateStr: date.toLocaleDateString('en-US', dateOpts),
        timeStr: date.toLocaleTimeString('en-US', timeOpts),
        location: perf.location,
        uuid: String(perf.id),
        routerLink: '/performance/' + perf.id
      };
    });
    this.processedPastDashPerfs = this.pastDashPerfs.sort((a, b) => {
      return b.dateTime - a.dateTime;
    }).map(perf => {
      let date = new Date(perf.dateTime);
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
  }

  checkDataLoaded(): boolean {
    this.dataLoaded = this.dashPerfsLoaded;
    return this.dataLoaded;
  }

}

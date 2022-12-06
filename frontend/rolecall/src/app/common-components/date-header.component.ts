import { Component, Input, OnInit,
} from '@angular/core';


export type DateChanger = (newDate: Date) => string;

// Coulnd not be inline below due to lint warnings.
const defaultDC = (date: Date): string => date.toLocaleDateString();

@Component({
  selector: 'app-date-header',
  templateUrl: './date-header.component.html',
  styleUrls: ['./date-header.component.scss']
})
export class DateHeaderComponent implements OnInit {

  @Input() date = new Date();
  @Input() changeDate: DateChanger = defaultDC;
  @Input() aria = '';
  @Input() tip = '';
  @Input() fontSize = '';

  header: string;
  oneBefore: string;
  twoBefore: string;
  threeBefore: string;
  refresh: string;

  backDates: Date[] = [];

  propagate = false;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    if (!this.aria && !this.tip) {
      this.aria = 'Change Header Date';
    }
    if (!this.tip) {
      this.tip = this.aria;
    }
    if (!this.aria) {
      this.aria = this.tip;
    }
    this.header = this.dateChange(this.date);
    this.backDates.push(new Date());
    this.backDates.push(new Date());
    this.backDates.push(new Date());
  }

  onMonthBack = (months: number): void => {
    if (months === 4) {
      this.dateChange(new Date(0));
    } else {
      this.header = this.dateChange(this.backDates[months - 1]);
    }
  };

  onDateChange = (newDate: Date): void => {
    this.header = this.dateChange(newDate);
    this.propagate = true;
  };

  dateChange = (newDate: Date): string => {
    if (newDate.getTime() !== new Date(0).getTime()) {
      this.oneBefore = `Back one month ${this.calcBefore(newDate, 1)}`;
      this.twoBefore = `Back two months ${this.calcBefore(newDate, 2)}`;
      this.threeBefore = `Back three months ${this.calcBefore(newDate, 3)}`;
      this.refresh = `Refresh current selection`;
    }
    return this.changeDate(newDate);
  };

  parentClick = (event: PointerEvent): void => {
    if (!this.propagate) {
      event.stopPropagation();
    } else {
      this.propagate = false;
    }
  };

  private calcBefore = (date: Date, months: number): string => {
    const currMonth = date.getMonth();
    const ix = months - 1;
    this.backDates[ix] = new Date(date);
    const year = date.getFullYear();
    const day = date.getDate();
    if (day > 28) {
      // The 0th day of next month is last day of this month
      const daysInMonth = (new Date(year, currMonth - months + 1, 0)).getDate();
      if (day > daysInMonth) {
        this.backDates[ix].setDate(daysInMonth);
      }
    }
    this.backDates[ix].setMonth(currMonth - months);
    return this.backDates[ix].toLocaleDateString();
  };

}

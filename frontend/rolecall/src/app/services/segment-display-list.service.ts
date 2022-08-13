import {Injectable} from '@angular/core';
import {Segment, SegmentType} from '../api/segment-api.service';
import {SuperBalletDisplayService} from './super-ballet-display.service';

// export type DisplaySegment = Segment & {
//   isOpen: boolean;
// };

export type DisplayItem = {
  name: string;
  segmentIndex: number;
  siblingId: number;
  type: SegmentType;
  isOpen: boolean;
  uuid: string;
};

@Injectable({providedIn: 'root'})
export class SegmentDisplayListService {
  public topLevelSegments: Segment[];
  public visibleItems: DisplayItem[];

  constructor(
    private superBalletDisplay: SuperBalletDisplayService,
  ) { }

  public buildDisplayList = (
    allSegments: Segment[],
    starTest: (segment: Segment) => boolean,
  ): void => {
    // Remove Super Ballet children
    this.topLevelSegments = allSegments.filter(segment => !segment.siblingId);
    this.topLevelSegments.sort((a, b) => a.name < b.name ? -1 : 1);
    for (let i = 0; i < this.topLevelSegments.length; i++) {
      const displaySegment = this.topLevelSegments[i];
      if (displaySegment.type === 'SUPER' &&
          this.superBalletDisplay.isOpen(displaySegment.uuid)) {
            displaySegment.isOpen = true;
        // If Super Ballet is open, add children
        displaySegment.positions.sort((a, b) => a.order < b.order ? -1 : 1);
        const children: Segment[] = [];
        for (const position of displaySegment.positions) {
          const uuid = String(position.siblingId);
          const child = allSegments.find(wp => wp.uuid === uuid);
          children.push(child);
        }
        this.topLevelSegments.splice(i + 1, 0, ...children);
      }
    }
    this.visibleItems = this.topLevelSegments.map(
        (displaySegment, displaySegmentIndex) =>
            this.buildDisplayItem(displaySegment, displaySegmentIndex,
              starTest));
  };

  private buildDisplayItem = (
      segment: Segment,
      segmentIndex: number,
      starTest: (segment: Segment) => boolean,
  ): DisplayItem => {
    const name = starTest(segment) ? '*' + segment.name : segment.name;
    return {
      name,
      segmentIndex,
      siblingId: segment.siblingId,
      type: segment.type,
      isOpen: segment.isOpen,
      uuid: segment.uuid,
    } as DisplayItem;
  };
}

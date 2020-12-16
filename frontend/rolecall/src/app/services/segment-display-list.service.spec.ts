import {SegmentDisplayListService} from './segment-display-list.service';
import {SuperBalletDisplayService} from './super-ballet-display.service';

describe('SegmentDisplayListService', () => {
  let service: SegmentDisplayListService;

  beforeEach(() => {
    const fakeSuoerBalletDisplay = {} as SuperBalletDisplayService;
    service = new SegmentDisplayListService(fakeSuoerBalletDisplay);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

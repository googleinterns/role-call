import {NumberToPlacePipe} from './number-to-place.pipe';

describe('NumberToPlacePipe', () => {
  let pipe: NumberToPlacePipe;

  beforeEach(() => {
    pipe = new NumberToPlacePipe();
  });

  it('create an instance', () => {
    pipe = new NumberToPlacePipe();
    expect(pipe).toBeTruthy();
  });

});

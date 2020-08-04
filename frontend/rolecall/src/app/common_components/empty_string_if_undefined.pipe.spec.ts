import { EmptyStringIfUndefinedPipe } from './empty_string_if_undefined.pipe';

describe('EmptyStringIfUndefinedPipe', () => {
  let pipe: EmptyStringIfUndefinedPipe;

  beforeEach(() => {
    pipe = new EmptyStringIfUndefinedPipe();
  });

  it('create an instance', () => {
    pipe = new EmptyStringIfUndefinedPipe();
    expect(pipe).toBeTruthy();
  });

  it('should produce an empty string if value is undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should produce an empty string if value is null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return the string if value is not undefined', () => {
    expect(pipe.transform('test')).toBe('test');
  });

});

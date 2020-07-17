import { TestBed } from '@angular/core/testing';
import { CacheTags, CacheValidatorService } from './cache_validator.service';


describe('CacheValidatorService', () => {
  let service: CacheValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add to the cache with string', () => {
    let cacheKey = "testKey";
    type testCacheObjType = { test: string; };
    let testCacheObj: testCacheObjType = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached<testCacheObjType>(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();
  });

  it('should add to the cache with CacheTags.USER', () => {
    let cacheKey = CacheTags.USER;
    type testCacheObjType = { test: string; };
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached<testCacheObjType>(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();
  });

  it('should add to the cache without generics', () => {
    let cacheKey = CacheTags.USER;
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();
  });

  it('should delete from the cache with string', () => {
    let cacheKey = "testKey";
    type testCacheObjType = { test: string; };
    let testCacheObj: testCacheObjType = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached<testCacheObjType>(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();

    service.setValid(cacheKey, false);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();
  });

  it('should delete from the cache with CacheTags.USER', () => {
    let cacheKey = CacheTags.USER;
    type testCacheObjType = { test: string; };
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached<testCacheObjType>(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();

    service.setValid(cacheKey, false);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached<testCacheObjType>(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();
  });

  it('should delete from the cache without generics', () => {
    let cacheKey = CacheTags.USER;
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();

    service.setValid(cacheKey, false);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();
  });

  it('should revalidate the cache', () => {
    let cacheKey = CacheTags.USER;
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();

    service.setValid(cacheKey, false);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setValid(cacheKey, true);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();
  });

  it('should clear the cache', () => {
    let cacheKey = CacheTags.USER;
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();

    service.setValid(cacheKey, false);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.clearCache();

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();
  });

  it('should be valid bit redundant if valid bit DNE', () => {
    let cacheKey = CacheTags.USER;
    let testCacheObj = { test: "test" };

    expect(service.cacheMap.size).toEqual(0);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();

    service.setCached(cacheKey, testCacheObj);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBe(testCacheObj);
    expect(service.getValid(cacheKey)).toBeTrue();

    service.validBits.delete(cacheKey);

    expect(service.cacheMap.size).toEqual(1);
    expect(service.getCached(cacheKey)).toBeNull();
    expect(service.getValid(cacheKey)).toBeFalse();
  });


});

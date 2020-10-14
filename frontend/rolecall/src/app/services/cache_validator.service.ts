import { Injectable } from '@angular/core';


export type CacheTag = CacheTags | string;

export enum CacheTags {
  USER = "USER",
  BALLETS = "BALLETS"
}


/**
 * This service is responsible for holding cached objects in memory,
 * as well as keeping track of which objects are still valid
 */
@Injectable({
  providedIn: 'root'
})
export class CacheValidatorService {

  /** The map of cache tags to cache objects */
  cacheMap = new Map<CacheTag, any>();
  /** The map of cache tags to valid bits (whether or not cache is still active) */
  validBits = new Map<CacheTag, boolean>();

  /** Sets the cache for a CacheTag */
  setCached<T>(tag: CacheTag, cachedObject: T) {
    this.cacheMap.set(tag, cachedObject);
    this.validBits.set(tag, true);
  }

  /** Gets the cached object for a CacheTag, or null if invalid or empty */
  getCached<T>(tag: CacheTag): T {
    if (!this.cacheMap.has(tag))
      return null;
    if (!this.validBits.has(tag))
      return null;
    if (!this.validBits.get(tag))
      return null;
    return this.cacheMap.get(tag);
  }

  /** Sets the validity of a CacheTag's cached object */
  setValid(tag: CacheTag, valid: boolean) {
    this.validBits.set(tag, valid);
  }

  /** Gets whether a CacheTag's cached object is still valid */
  getValid(tag: CacheTag): boolean {
    if (!this.validBits.has(tag))
      return false;
    return this.validBits.get(tag);
  }

  /** Clears the cache */
  clearCache() {
    this.cacheMap.clear();
    this.validBits.clear();
  }

}

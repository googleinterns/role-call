import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {Component} from '@angular/core';

/**
 * Creates a jasmine SpyObj with the given methods provided as object or
 * string-array, and assigns the given properties to be available on that
 * object.
 */
export const createSpyObjWithProps = <T>({baseName, methods, props}: {
  baseName: string;
  methods: jasmine.SpyObjMethodNames<T>;
  props: object;
}): SpyObj<T> => ({
  ...createSpyObj(baseName, methods),
  ...props,
} as SpyObj<T>);

/** Empty component useful for testing route navigation. */
@Component({template: ''})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class FakePage {
}

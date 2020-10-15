import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

/**
 * Creates a jasmine SpyObj with the given methods provided as object or
 * string-array, and assigns the given properties to be available on that
 * object.
 */
export function createSpyObjWithProps<T>({baseName, methods, props}: {
  baseName: string,
  methods: jasmine.SpyObjMethodNames<T>,
  props: object
}): SpyObj<T> {
  return {
    ...createSpyObj(baseName, methods),
    ...props,
  } as SpyObj<T>;
}

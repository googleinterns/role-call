import {Pipe, PipeTransform} from '@angular/core';
import {isNullOrUndefined} from 'util';

@Pipe({
  name: 'emptyStringIfUndefined'
})
export class EmptyStringIfUndefinedPipe implements PipeTransform {

  public transform(value: unknown): unknown {
    if (isNullOrUndefined(value)) {
      return '';
    } else {
      return value;
    }
  }
}

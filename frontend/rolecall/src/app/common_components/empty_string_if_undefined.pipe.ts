import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'emptyStringIfUndefined'
})
export class EmptyStringIfUndefinedPipe implements PipeTransform {

  public transform(value: unknown): unknown {
    if (!value) {
      return '';
    } else {
      return value;
    }
  }
}

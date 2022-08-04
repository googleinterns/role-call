import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'numberToPlace'
})
export class NumberToPlacePipe implements PipeTransform {

  public transform = (value: number): string => {
    let end;
    if (String(value).endsWith('1')) {
      end = 'st';
    } else if (String(value).endsWith('2')) {
      end = 'nd';
    } else if (String(value).endsWith('3')) {
      end = 'rd';
    } else {
      end = 'th';
    }
    return value + end;
  };

}

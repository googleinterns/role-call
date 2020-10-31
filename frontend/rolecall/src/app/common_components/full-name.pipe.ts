import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../api/user_api.service';

@Pipe({
  name: 'fullName'
})
export class FullNamePipe implements PipeTransform {

  public transform(user: User, ...args: unknown[]): string {
    if (!user) {
      return "";
    }
    let fullName = user.first_name ? user.first_name + " ": "";
    fullName += user.middle_name ? user.middle_name + " " : "";
    fullName += user.last_name ? user.last_name : "";
    fullName += user.suffix ? user.suffix : "";
    return fullName;
  }
}

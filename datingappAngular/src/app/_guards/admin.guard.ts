import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountService } from '../_services/account.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private accountSerivce : AccountService, private toastr :ToastrService) {}


  canActivate(): Observable<boolean> {
    return this.accountSerivce.currentUser$.pipe(
      map(user=> {
        if(user.roles.includes('Admin') || user.roles.includes('Moderator')) {
          return true;
        }
        this.toastr.error('you can not enter this area')
        return false;
      })
    )

}
}

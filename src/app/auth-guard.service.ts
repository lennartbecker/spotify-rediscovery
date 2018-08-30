import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthorizeService } from './authorize.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthorizeService, public router: Router) { }

  canActivate(): boolean {
    if (!this.auth.getAccessToken()) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}

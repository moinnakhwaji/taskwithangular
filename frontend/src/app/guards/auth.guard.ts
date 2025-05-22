import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate() {
    return authState(this.auth).pipe(
      map(user => {
        if (user) {
          return true;  // allow access
        } else {
          this.router.navigate(['/login']);  // redirect to login if not logged in
          return false;
        }
      })
    );
  }
}

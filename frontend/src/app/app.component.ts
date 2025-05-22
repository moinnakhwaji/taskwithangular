import { Component, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterModule]
})
export class AppComponent {
  title = 'Your App Title';

  private auth = inject(Auth);

  constructor() {
    authState(this.auth).subscribe(user => {
      console.log('Current user:', user);
    });
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(cred => console.log('Logged in:', cred.user))
      .catch(err => console.error(err));
  }

  logout() {
    signOut(this.auth);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: Auth, private router: Router) {}

  register() {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }
    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then(() => this.router.navigate(['/']))
      .catch(err => (this.error = err.message));
  }

  registerWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(() => this.router.navigate(['/']))
      .catch(err => (this.error = err.message));
  }
}

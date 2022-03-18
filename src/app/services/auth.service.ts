
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private Auth: AngularFireAuth,  private router:Router, ) { }


  fbProvider = new auth.FacebookAuthProvider();

  loginWithFB() {
    this.Auth.auth.signInWithPopup(this.fbProvider)
    .then((result) => {
      this.router.navigateByUrl('/mapa')
      console.log(result);
    })
    .catch(err => {
      console.log(err.message);
    })
  }
  logout() {
    return this.Auth.auth.signOut();
  }

}



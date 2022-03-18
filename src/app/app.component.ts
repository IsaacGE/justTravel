import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Uber Viajes';
  userInfo: any;

  navList: {
    login: boolean,
    mapa: boolean,
    logout: boolean,
    viajes: boolean
  }


  constructor(private router: Router) {
    this.navList = {
      login: false,
      mapa: true,
      logout: true,
      viajes: true
    }


    let userInfoStr = localStorage.getItem('userUber');

    if (!userInfoStr) {
      this.navList.login = false;
      this.navList.logout = true;
      this.navList.mapa = true;
      this.navList.viajes = true;
      this.router.navigateByUrl('/login');
    } else {
      this.navList.login = true;
      this.navList.logout = false;
      this.navList.mapa = false;
      this.navList.viajes = false;
      this.userInfo = JSON.parse(userInfoStr);
      //console.log('Info del usuario', this.userInfo);
    }
  }

  // Creando funcion para boorar los datos de localStorage y cerrar la sesion (Logout)
  logout() {
    Swal.fire({
      title: "¿Cerrar la sesión?",
      text: "¿Estas a punto de cerrar la sesión?",
      showDenyButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      icon: 'question',
      confirmButtonText: "Si, cerrar",
      cancelButtonText: "No, permanecer"
    })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire("!Listo¡", "Has cerrado sesión", 'success')
          localStorage.removeItem('userUber')
          location.reload();
          this.router.navigateByUrl('/login');
        } else if (result.isDismissed) {
          Swal.fire('Continua Navegando');
        }
      });
  }

  ngOnInit(): void {
  }
}

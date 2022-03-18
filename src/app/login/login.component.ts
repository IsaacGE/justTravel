import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'Login Uber-Viajes';

  usuariosList: AngularFireList<any>;
  usuarios: Array<any>;

  email = '';
  pass = '';

  usuariosForm: {
    $key?: string,
    user: string,
    nombre: string,
    apellido: string,
    correo: string,
    pass: string
  }

  constructor(private router: Router, public firebase: AngularFireDatabase, private authService: AuthService) {
    let userInfo = localStorage.getItem('userUber');

    if (userInfo) {
      this.router.navigateByUrl('/mapa');
    }

    this.usuariosForm = {
      $key: '',
      user: '',
      nombre: '',
      apellido: '',
      correo: '',
      pass: ''
    }
    this.usuariosList = this.firebase.list('usuarios');

    this.usuarios = [];
    /////Código para obtener los usaurios dados de alta
    this.usuariosList.snapshotChanges().subscribe(item => {
      this.usuarios = []
      item.forEach(usuario => {
        let x: any = usuario.payload.toJSON();
        x["$key"] = usuario.key
        this.usuarios.push(x)
      })
      console.log('USUARIOS', this.usuarios);
    })
  }

  registrarUsuario() {
    if (this.usuariosForm.$key == '') {
      delete this.usuariosForm.$key;
      if (this.usuariosForm.user == '' || this.usuariosForm.nombre == '' || this.usuariosForm.apellido == '' || this.usuariosForm.correo == '' || this.usuariosForm.pass == '') {
        Swal.fire("¡Espera!", "Asegurate de llenar todos los campos", "warning");
        this.router.navigateByUrl('/login');
      } else {
        this.usuariosList.push(this.usuariosForm)
        Swal.fire("¡Hola! " + this.usuariosForm.user, "Te has registrado con éxito", "success");
        this.limpiarDatos()
        this.router.navigateByUrl('/mapa');
      }
    } else {
      let keyTemp = this.usuariosForm.$key ? this.usuariosForm.$key : '';

      delete this.usuariosForm.$key;

      if (this.usuariosForm.user == '' || this.usuariosForm.nombre == '' || this.usuariosForm.apellido == '' || this.usuariosForm.correo == '' || this.usuariosForm.pass == '') {
        Swal.fire("¡Espera!", "Asegurate de llenar todos los campos", "warning");
      } else {
        this.usuariosList.update(keyTemp, this.usuariosForm)
        this.limpiarDatos()
        alert('ACTUALIZÓ SU INFORMACIÓN EXITOSAMENTE')
      }
    }
    console.log('USUARIO EN EL FORMULARIO', this.usuariosForm)
  }

  limpiarDatos() {
    this.usuariosForm = {
      $key: '',
      user: '',
      nombre: '',
      apellido: '',
      correo: '',
      pass: ''
    }
  }

  // Login with Facebook
  loginFB() {
    this.authService.loginWithFB();
  }

  userLogin() {
    let usuarioCorrecto = this.usuarios.filter(usuario => usuario.correo === this.email && usuario.pass === this.pass)
    if (usuarioCorrecto.length > 0) {
      //Almacenar datos necesarios del usuario en un JSON llamado datosUsuario
      let datosUsuario = {
        id: usuarioCorrecto[0].$key,
        username: usuarioCorrecto[0].user,
        name: usuarioCorrecto[0].nombre,
        lastName: usuarioCorrecto[0].apellido,
        email: usuarioCorrecto[0].correo
      }
      let datosUsuarioStr = JSON.stringify(datosUsuario); // Hacer la conversión del JSON a String para que el localStorage lo acepte
      localStorage.setItem('userUber', datosUsuarioStr);
      Swal.fire("¡Hola! " + datosUsuario.name, "¡Comienza a viajar!", "success");
      this.router.navigateByUrl('/mapa');
      location.reload();
      //console.log(usuarioCorrecto);
    } else {
      Swal.fire("¡Error!", "Correo y/o contraseña incorrectos", "error");
    }
  }

  ngOnInit(): void {
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.scss']
})
export class ViajesComponent implements OnInit {
  userInfo: any;
  viajesList: AngularFireList<any>;
  viajes: Array<any>;

  constructor(private router: Router, public firebase: AngularFireDatabase) {
    let userInfoStr = localStorage.getItem('userUber');
    if (!userInfoStr) {
      this.router.navigateByUrl('/login');
    } else {
      this.userInfo = JSON.parse(userInfoStr);
    }


    let userKey = this.userInfo.id;
    console.log("KEY USUARIO", userKey);

    this.viajesList = this.firebase.list('viajes');

    this.viajes = [];
    this.viajesList.snapshotChanges().subscribe(item => {
      this.viajes = []
      item.forEach(viaje => {
        let x: any = viaje.payload.toJSON();
        x["$key"] = viaje.key
        this.viajes.push(x)
        this.viajes = this.viajes.filter(viaje => viaje.idUsuario == userKey);
      })
    })
  }

  ngOnInit(): void {
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import Swal from 'sweetalert2';


declare const L: any;
@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit {

  userInfo: any;
  viajesList: AngularFireList<any>;
  viajes: Array<any>;

  viajesForm: {
    $key?: string,
    coorsInicio: string,
    coorsDestino: string,
    costo: string,
    fecha: string,
    idUsuario: string
  }

  latLong: number[]; //Origen
  latlngDest: number[]; //Destino
  costoViaje: number;
  distancia: number;
  tiempo: number;
  fecha: Date;
  lat0: number;
  long0: number;
  lat1: number;
  long1: number;

  constructor(private router: Router, public firebase: AngularFireDatabase) {
    let userInfoStr = localStorage.getItem('userUber');

    if (!userInfoStr) {
      this.router.navigateByUrl('/login');
    } else {
      this.userInfo = JSON.parse(userInfoStr);
    }

    this.viajesList = this.firebase.list('viajes');

    this.latLong = [0, 0]; //Origen
    this.latlngDest = [21.883623132655234, -102.29526894441786]; //Destino
    this.costoViaje = 0;
    this.distancia = 0;
    this.tiempo = 0;
    this.fecha = new Date();
    this.lat0 = 0;
    this.long0 = 0;
    this.lat1 = 0;
    this.long1 = 0;

    this.viajesForm = {
      $key: '',
      coorsInicio: '',
      coorsDestino: '',
      costo: '',
      fecha: '',
      idUsuario: this.userInfo.id
    }

    this.viajes = [];
    this.viajesList.snapshotChanges().subscribe(item => {
      this.viajes = []
      item.forEach(viaje => {
        let x: any = viaje.payload.toJSON();
        x["$key"] = viaje.key
        this.viajes.push(x)
      })
      //console.log('VIAJES: ', this.viajes);
    })
  }

  registrarViaje() {
    this.viajesList.push(this.viajesForm)
    //console.log('VIAJE EN EL FORMULARIO', this.viajesForm)
  }

  // Calculando costo de Viaje
  viajeCosto() {
    if (this.distancia / 1000 > 1 && this.distancia / 1000 <= 10) {
      this.costoViaje = 13.5 * this.distancia / 1000;
    } else if (this.distancia / 1000 > 10 && this.distancia / 1000 <= 30) {
      this.costoViaje = 12.3 * this.distancia / 1000;
    } else {
      this.costoViaje = 10.6 * this.distancia / 1000;
    }
  }

  ngOnInit() {
    if (!navigator.geolocation) {
      console.log('location is not supported');
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const coords = position.coords;
      this.latLong = [coords.latitude, coords.longitude]; //Origen
      this.latlngDest = [21.883623132655234, -102.29526894441786]; //Destino

      this.lat0 = this.latLong[0];
      this.long0 = this.latLong[1];
      this.lat1 = this.latlngDest[0];
      this.long1 = this.latlngDest[1];

      var distance = 0;
      var time = 0;

      console.log(
        `latOrigen: ${position.coords.latitude}, lonOrigen: ${position.coords.longitude}`
      );
      let mymap = L.map('map').setView(this.latLong, 13);

      let ruta = L.Routing.control({
        waypoints: [
          L.latLng(coords.latitude, coords.longitude),
          L.latLng(this.latlngDest),
        ]
      }).addTo(mymap);

      // Obteniendo la distancia y tiempo de la ruta
      function distRoute() {
        ruta.on('routesfound', function (e: any) {
          distance = e.routes[0].summary.totalDistance; // Distancia
          time = e.routes[0].summary.totalTime; // Tiempo
        });
      }
      //console.log("Obtn Disancia: "+distance)

      L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3VicmF0MDA3IiwiYSI6ImNrYjNyMjJxYjBibnIyem55d2NhcTdzM2IifQ.-NnMzrAAlykYciP4RP9zYQ',
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: 'pk.eyJ1IjoiYWxmcmVkby1jYXN0aWxsbyIsImEiOiJja3R6NTVuOXExazV4MnVxbTZlMTd0N2E3In0.Z-U3MFRclsA-vWYq_KY2_Q',
        }
      ).addTo(mymap);

      var myIcon = L.icon({
        iconUrl: '../assets/marker.png',
        iconSize: [38, 38]
      });

      let marker = L.marker(this.latLong, { draggable: true, icon: myIcon }).addTo(mymap);

      marker.on('dragend', (objeto: any) => {
        console.log('El objeto recibido cuando se dejó de arrastrar el marcador es: ', objeto)
        alert("El marcador se detuvo en LAT:" + objeto.target._latlng.lat + " LNG:" + objeto.target._latlng.lng)
      })

      let clickMarkers = L.layerGroup().addTo(mymap)
      ///Adding leaflet routing machine

      mymap.on('click', (objeto: any) => {
        console.log('En click', objeto)
        this.lat1 = objeto.latlng.lat;
        this.long1 = objeto.latlng.lng;
        this.latlngDest = [this.lat1, this.long1];
        clickMarkers.clearLayers();
        clickMarkers.addLayer(L.marker(this.latlngDest, { icon: myIcon }));
        ruta.spliceWaypoints(1, 1, this.latlngDest);
        // Obteniendo la distancia y tiempo de la ruta
        distRoute();
        this.distancia = distance;
        this.viajeCosto();
        //console.log("Obteniedno distancia: " + this.distancia)
        //console.log("Al cambiar punto: " + latlngDest);
        // Proando las coordenadas en la consola
        //console.log("El origen para calculo: " + lat0, long0);
        //console.log("El destino para calculo: " + lat1, long1);
        //console.log("La distancia es " + distancia / 1000 + "km");
        //console.log("El tiempo es: " + tiempo / 60);
      })


      marker.bindPopup('<b>Estas aquí</b>').openPopup();


      let popup = L.popup()
        .setLatLng(this.latLong)
        .setContent('Tu origen es aquí')
        .openOn(mymap);



      ///Adding esri leaflet

      var arcgisOnlineProvider = L.esri.Geocoding.arcgisOnlineProvider({
        apikey: 'AAPKddfb706fb169401bade2b6c31b4e049a-C5zyF7oA9g6PF0O1lK09hxZi_Aukt2yz4rVvo6UAx8usjGggUTsRsE4LOSxHqGB' // replace with your api key - https://developers.arcgis.com
      });

      let buscador = L.esri.Geocoding.geosearch({
        providers: [arcgisOnlineProvider]
      }).addTo(mymap);

      let results = L.layerGroup().addTo(mymap)

      buscador.on('results', (data: any) => {
        results.clearLayers();
        for (var i = data.results.length - 1; i >= 0; i--) {
          results.addLayer(L.marker(data.results[i].latlng));
          //Aquí va el código para actualizar la ruta
          ruta.spliceWaypoints(1, 1, data.results[i].latlng);
        }
        // Obteniendo la distancia y tiempo de la ruta
        distRoute();
        this.distancia = distance;
        this.viajeCosto();
        //console.log("Obteniedno distancia: " + this.distancia)
        this.lat1 = data.results[0].latlng.lat;
        this.long1 = data.results[0].latlng.lng;
        this.latlngDest = [this.lat1, this.long1];
        //console.log("Al cambiar punto destino: " + latlngDest);
        // Obtenidndo la distancia de los puntos de inicio y destono
        //console.log("El origen para calculo: " + lat0, long0);
        //console.log("El destino para calculo: " + lat1, long1);
      })


    });

    this.watchPosition();

  }

  confirmViaje() {
    let corInicioStr = this.latLong.toString();
    let corDestinoStr = this.latlngDest.toString();
    let costoRed = this.costoViaje.toFixed(2);
    let fechaStr = this.fecha.toString();
    this.viajesForm = {
      coorsInicio: corInicioStr,
      coorsDestino: corDestinoStr,
      costo: costoRed,
      fecha: fechaStr,
      idUsuario: this.userInfo.id
    }
    Swal.fire({
      title: "¿Confirmar Viaje?",
      showCancelButton: true,
      showDenyButton: false,
      confirmButtonText: 'Confirmar',
      text: "El Costo del Viaje es de: $" + costoRed + " MNX",
      icon: "warning"
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.registrarViaje();
          Swal.fire("!Listo¡", 'Tu viaje esta listo', 'success');
        } else if (result.isDismissed) {
          Swal.fire('¡Viaje Cancelado!', '', 'info');
        }
      });
  }

  watchPosition() {
    let desLat = 0;
    let desLon = 0;
    let id = navigator.geolocation.watchPosition(
      (position) => {
        const coords = position.coords;
        console.log(
          `lat: ${coords.latitude}, lon: ${coords.longitude}`
        );
        if (position.coords.latitude === desLat) {
          navigator.geolocation.clearWatch(id);
        }
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }
}


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MapaComponent } from './mapa/mapa.component';
import { ViajesComponent } from './viajes/viajes.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'mapa', component: MapaComponent},
  {path: 'viajes', component: ViajesComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'mapa'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

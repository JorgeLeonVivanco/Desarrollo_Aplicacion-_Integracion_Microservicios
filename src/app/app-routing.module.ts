import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeClienteComponent } from './home-cliente/home-cliente.component';
import { HomeProveedorComponent } from './home-proveedor/home-proveedor.component';
import { SubscriptionTypesComponent } from './subscription-types/subscription-types.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { clienteGuard } from './guards/cliente.guard';
import { proveedorGuard } from './guards/proveedor.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },   // Solo clientes
  { path: 'cliente/home', component: HomeClienteComponent, canActivate: [clienteGuard] },
  { path: 'subscription-types', component: SubscriptionTypesComponent },
  { path: 'proveedor/home', component: HomeProveedorComponent, canActivate: [proveedorGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

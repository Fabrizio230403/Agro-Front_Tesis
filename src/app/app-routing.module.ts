import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';  
import { AuthGuard } from './auth.guard';
import { ProveedoresComponent} from './features/proveedores/proveedores.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from '../app/core/login/login.component'
import { RegisterComponent } from './core/register/register.component';
import { InventarioComponent } from './features/inventario/inventario.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { GestionProductosComponent } from './features/Productos/gestion-productos/gestion-productos.component';
import { FiltrarModalComponent } from './features/Productos/filtrar-modal/filtrar-modal.component';
import { VentasComponent } from './features/ventas/ventas/ventas.component';
import { RolesListComponent } from './components/roles/roles-list/roles-list.component';
import { RoleDetailComponent } from './components/roles/role-detail/role-detail.component';
import { CreateRoleComponent } from './components/roles/create-role/create-role.component';
import { CreatePermissionComponent } from './components/roles/create-permission/create-permission.component';
import { AssignPermissionsComponent } from './components/roles/assign-permissions/assign-permissions.component';
import { RoleManagerComponent } from './components/roles/role-manager/role-manager.component';
import { RolesComponent } from './components/roles/roles/roles.component';
import { PerfilComponent } from '../app/components/User/perfil/perfil.component';
import { UsersComponent } from '../app/components/User/users/users.component';
import { RoleModalComponent } from './components/roles/role-modal/role-modal.component';
import { DocumentosComponent } from './features/documentos/documentos/documentos.component'
import { ReportesComponent } from './features/reportes/reportes.component';
import { PermisosComponent } from './components/permisos/permisos.component';
import { GestionComponent } from './features/gestion/gestion.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ventas', component: VentasComponent, canActivate: [AuthGuard] },
  { path: 'roles1', component: RoleModalComponent, canActivate: [AuthGuard] },
  { path: 'ventas', component: VentasComponent, canActivate: [AuthGuard] }, 
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: 'productos', component: GestionProductosComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: FiltrarModalComponent, canActivate: [AuthGuard] },
  { path: 'documento', component: DocumentosComponent, canActivate: [AuthGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },
  { path: 'roles', component: RolesListComponent, canActivate: [AuthGuard] },
  { path: 'roles/ajustes', component: AssignPermissionsComponent, canActivate: [AuthGuard] },
  { path: 'roles/detalle/:id', component: RoleDetailComponent, canActivate: [AuthGuard] },
  { path: 'roles/crear', component: CreateRoleComponent, canActivate: [AuthGuard] },
  { path: 'permisos', component: PermisosComponent, canActivate: [AuthGuard] },
  { path: 'permisos/crear', component: CreatePermissionComponent, canActivate: [AuthGuard] },
  { path: 'role', component: RolesComponent, canActivate: [AuthGuard] },
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [AuthGuard]},
  { path: 'gestion', component: GestionComponent, canActivate: [AuthGuard]},
  { path: 'ventas', component: VentasComponent, canActivate: [AuthGuard] },  
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],  
  exports: [RouterModule],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy } 
  ]
})
export class AppRoutingModule { }
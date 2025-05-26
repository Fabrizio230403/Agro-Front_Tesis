import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Unificar FormsModule y ReactiveFormsModule aquí
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProveedoresComponent } from './features/proveedores/proveedores.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgxPaginationModule, } from 'ngx-pagination';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InventarioComponent } from './features/inventario/inventario.component';

// Importaciones de Font Awesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { SiderbangComponent } from './shared/siderbang/siderbang.component';
import { HeaderComponent } from './shared/header/header.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LoginComponent } from './core/login/login.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { ConfirmDeleteModalComponent } from './features/clientes/confirm-delete-modal/confirm-delete-modal.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AgregarUsuarioComponent } from './features/clientes/agregar-usuario/agregar-usuario.component';
import { EditarClienteComponent } from './features/clientes/editar-cliente/editar-cliente.component';
import { GestionProductosComponent } from './features/Productos/gestion-productos/gestion-productos.component';
import { AgregarModalComponent } from './features/Productos/agregar-modal/agregar-modal.component';
import { EditarModalComponent } from './features/Productos/editar-modal/editar-modal.component';
import { FiltrarModalComponent } from './features/Productos/filtrar-modal/filtrar-modal.component';
import { CarritoModalComponent } from './features/Productos/carrito-modal/carrito-modal.component';
import { DetallesModalComponent } from './features/Productos/detalles-modal/detalles-modal.component';
import { DocumentosComponent } from './features/documentos/documentos/documentos.component';
import { EditarDocComponent } from './features/documentos/modals/editar-doc/editar-doc.component';
import { AgregarDocComponent } from './features/documentos/modals/agregar-doc/agregar-doc.component';
import { EnviarDocComponent } from './features/documentos/modals/enviar-doc/enviar-doc.component';
import { EliminarDocComponent } from './features/documentos/modals/eliminar-doc/eliminar-doc.component';

// Asegúrate de importar FormsModule
import { AgregarClienteComponent } from './features/clientes/agregar-cliente/agregar-cliente.component';
import { RolesListComponent } from './components/roles/roles-list/roles-list.component';
import { RoleDetailComponent } from './components/roles/role-detail/role-detail.component';
import { CreateRoleComponent } from './components/roles/create-role/create-role.component';
import { CreatePermissionComponent } from './components/roles/create-permission/create-permission.component';
import { SuccessModalComponent } from './components/roles/success-modal/success-modal.component';
import { AssignPermissionsComponent } from './components/roles/assign-permissions/assign-permissions.component';
import { RoleManagerComponent } from './components/roles/role-manager/role-manager.component';
import { RolesComponent } from './components/roles/roles/roles.component';
import { RoleDeleteComponent } from './components/roles/role-delete/role-delete.component';
import { VentasComponent } from './features/ventas/ventas/ventas.component';
import { PerfilComponent } from '../app/components/User/perfil/perfil.component';
import { UsersComponent } from '../app/components/User/users/users.component';
import { RoleModalComponent } from './components/roles/role-modal/role-modal.component';
import { EditUserComponent } from '../app/components/User/edit-user/edit-user.component';
import { AddUserComponent } from '../app/components/User/add-user/add-user.component';
import { DeleteUserComponent } from '../app/components/User/delete-user/delete-user.component';
import { RegisterComponent } from './core/register/register.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { AgregarReporteComponent } from './features/reportes/agregar-reporte/agregar-reporte.component';
import { EditarReporteComponent } from './features/reportes/editar-reporte/editar-reporte.component';
import { TipoReporteComponent } from './features/reportes/tipo-reporte/tipo-reporte.component';
import { ExportarReporteComponent } from './features/reportes/exportar-reporte/exportar-reporte.component';
import { AgregarCategoriaComponent } from './features/Productos/modalCategoria/agregar-categoria/agregar-categoria.component';
import { EliminarCategoriaComponent } from './features/Productos/modalCategoria/eliminar-categoria/eliminar-categoria.component';
import { EditarCategoriaComponent } from './features/Productos/modalCategoria/editar-categoria/editar-categoria.component';
import { ClienteDetalleComponent } from './features/clientes/cliente-detalle/cliente-detalle.component';
import { AddStockModalComponent } from './features/inventario/add-stock-modal/add-stock-modal.component';
import { HistorialMovimientosModalComponent } from './features/inventario/historial-movimientos-modal/historial-movimientos-modal.component';
import { DescargarGesComponent } from './features/gestion/descargar-ges/descargar-ges.component';
import { GestionComponent } from './features/gestion/gestion.component';
import { EliminarGesComponent } from './features/gestion/eliminar-ges/eliminar-ges.component';
import { EnviarGesComponent } from './features/gestion/enviar-ges/enviar-ges.component';
import { VerGesComponent } from './features/gestion/ver-ges/ver-ges.component';
import { PermisosComponent } from './components/permisos/permisos.component';
import { UserDetailsComponent } from './components/User/user-details/user-details.component';
import { EditPermissionsModalComponent } from './components/User/edit-permissions-modal/edit-permissions-modal.component';
import { EditRoleModalComponent } from './components/User/edit-role-modal/edit-role-modal.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './services/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    PerfilComponent,
    ProveedoresComponent,
    DashboardComponent,
    SiderbangComponent,
    HeaderComponent,
    VentasComponent,
    AgregarClienteComponent,
    InventarioComponent,
    ClientesComponent,
    ConfirmDeleteModalComponent,
    AgregarUsuarioComponent,
    EditarClienteComponent,
    GestionProductosComponent,
    AgregarModalComponent,
    EditarModalComponent,
    FiltrarModalComponent,
    CarritoModalComponent,
    DetallesModalComponent,
    RolesListComponent,
    RoleDetailComponent,
    CreateRoleComponent,
    CreatePermissionComponent,
    SuccessModalComponent,
    AssignPermissionsComponent,
    RoleManagerComponent,
    RolesComponent,
    RoleDeleteComponent,
    LoginComponent,
    DocumentosComponent,
    EditarDocComponent,
    AgregarDocComponent,
    EnviarDocComponent,
    EliminarDocComponent,
    PerfilComponent,
    UsersComponent,
    RoleModalComponent,
    EditUserComponent,
    AddUserComponent,
    DeleteUserComponent,
    RegisterComponent,
    ReportesComponent,
    AgregarReporteComponent,
    EditarReporteComponent,
    TipoReporteComponent,
    ExportarReporteComponent,
    AgregarCategoriaComponent,
    EliminarCategoriaComponent,
    EditarCategoriaComponent,
    ClienteDetalleComponent,
    AddStockModalComponent,
    HistorialMovimientosModalComponent,
    DescargarGesComponent,
    GestionComponent,
    EliminarGesComponent,
    EnviarGesComponent,
    VerGesComponent,
    PermisosComponent,
    UserDetailsComponent,
    EditPermissionsModalComponent,
    EditRoleModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    HttpClientModule,
    NgxPaginationModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    NgxDatatableModule,

  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true,  // importante para permitir múltiples interceptores
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
 import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private baseUrl = 'http://localhost:8091/api/roles';

  constructor(private http: HttpClient) {}

  // Listar todos los roles
  getRoles(): Observable<any> {
    return this.http.get(this.baseUrl, { withCredentials: true }).pipe(
      catchError((error) => {
        if (error.status !== 200) {
        console.error('Error al obtener roles:', error);
        return throwError(() => new Error('No se pudieron obtener los roles.'));
      }
      return throwError(() => error);
      })
    );
  }

  // Registrar un nuevo rol (con autenticación)
  createRole(roleData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/nuevo`, roleData, { withCredentials: true }).pipe(
      catchError((error) => {
        if (error.status !== 201) { // Solo capturar errores reales
          console.error('Error al crear rol:', error);
          return throwError(() => new Error('No se pudo crear el rol.'));
        }
        return throwError(() => error); // Permitir respuestas 201 pasar
      })
    );
  }

  // Obtener detalles de un rol
  getRoleById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/details/${id}`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error(`Error al obtener el rol con ID ${id}:`, error);
        return throwError(() => new Error('No se pudo obtener el rol.'));
      })
    );
  }

  // Editar un rol
  updateRole(roleId: number, roleData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/editar/${roleId}`, roleData, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al editar rol:', error);
        return throwError(() => new Error('No se pudo editar el rol.'));
      })
    );
  }

  // Eliminar un rol por ID
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar/${id}`, { withCredentials: true }).pipe(
      catchError((error) => {
        if (error.status === 200 || error.status === 204) {
          // Si el servidor responde con 200 o 204, no es un error
          return of(null); // Retornar un observable vacío indicando éxito
        }
        console.error(`Error al eliminar el rol con ID ${id}:`, error);
        return throwError(() => new Error('No se pudo eliminar el rol.'));
      })
    );
  }

  // Listar todos los permisos
  getPermissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/permissions`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al obtener permisos:', error);
        return throwError(() => new Error('No se pudieron obtener los permisos.'));
      })
    );
  }

  // Registrar un nuevo permiso
  createPermission(permissionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/permissions/nuevo`, permissionData, { withCredentials: true });
  }

  // Editar un permiso
  updatePermission(id: number, permissionData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/permissions/editar/${id}`, permissionData, { withCredentials: true });
  }

  // Eliminar un permiso de un rol
  deletePermissionFromRole(permissionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/permissions/eliminar/${permissionId}`, { withCredentials: true }).pipe(
      catchError((error) => {
        if (error.status === 200 || error.status === 204) {
          // Devolver un objeto indicando éxito en lugar de `null`
          return of({ success: true });
        }
        console.error(`❌ Error al eliminar el rol con ID ${permissionId}:`, error);
        return throwError(() => new Error('No se pudo eliminar el rol.'));
      })
    );
  }  

  // Obtener todos los permisos
  getPermissionsT(): Observable<any> {
    return this.http.get(`${this.baseUrl}/permissionsT`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al obtener permisos:', error);
        return throwError(() => new Error('No se pudieron obtener los permisos.'));
      })
    );
  }

  // Editar un permiso existente
  editPermission(id: number, permissionData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/permissions/editar/${id}`, permissionData, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error(`Error al editar permiso con ID ${id}:`, error);
        return throwError(() => new Error('No se pudo editar el permiso.'));
      })
    );
  }

  // Asignar o desasignar permisos a un rol
  updatePermissions(rolId: number, permissions: number[]): Observable<any> {
    const url = `${this.baseUrl}/${rolId}/permissions`;
    const body = { permissions };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    return this.http.post<any>(url, body, { headers, withCredentials: true }).pipe(
      catchError((error) => {
        if (error.status !== 201) { // Solo capturar errores reales
          console.error('❌ Error en la solicitud:', error);
          return throwError(() => new Error('No se pudieron actualizar los permisos.'));
        }
        return throwError(() => error); // Permitir respuestas 201 pasar
      })
    );
  }
  
}
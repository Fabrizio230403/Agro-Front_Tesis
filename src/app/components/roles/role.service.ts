 import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  [x: string]: any;
  private rolesData = {
    roles: [
      {
        role_id: 1,
        role_name: 'Admin',
        modules: [
          {
            module_name: 'Dashboard',
            permissions: [
              { permission_name: 'View Dashboard' }
            ]
          },
          {
            module_name: 'Content Management',
            permissions: [
              { permission_name: 'Edit Content' },
              { permission_name: 'Delete Content' }
            ]
          }
        ]
      },
      {
        role_id: 2,
        role_name: 'User',
        modules: [
          {
            module_name: 'Dashboard',
            permissions: [
              { permission_name: 'View Dashboard' }
            ]
          }
        ]
      }
    ]
  };
  

  // Obtener todos los roles
  getRoles(): Observable<any> {
    return of(this.rolesData.roles);
  }
  
  getRoles1(): Observable<any> {
    return of({ roles: this.rolesData.roles }); // Ajustamos para devolver un objeto con "roles"
  }
  
  // Obtener un rol específico
  getRoleById(roleId: number): Observable<any> {
    const role = this.rolesData.roles.find(r => r.role_id === roleId);
    return of(role || null);
  }

  // Crear un nuevo rol
  addRole(newRole: any): Observable<any> {
    newRole.role_id = this.rolesData.roles.length + 1;
    this.rolesData.roles.push(newRole);
    return of(newRole);
  }

  // Crear un nuevo módulo
  addModuleToRole(roleId: number, newModule: any): Observable<any> {
    const role = this.rolesData.roles.find(r => r.role_id === roleId);
    if (role) {
      role.modules.push(newModule);
      return of(newModule);
    }
    return of(null);
  }

  // Crear un nuevo permiso dentro de un módulo
  addPermissionToModule(roleId: number, moduleName: string, newPermission: any): Observable<any> {
    const role = this.rolesData.roles.find(r => r.role_id === roleId);
    if (role) {
      const module = role.modules.find(m => m.module_name === moduleName);
      if (module) {
        newPermission.permission_name = newPermission.permission_name || `New Permission ${module.permissions.length + 1}`;
        module.permissions.push(newPermission);
        return of(newPermission);
      }
    }
    return of(null);
  }

  // Asignar un permiso a un módulo
  assignPermissionToModule(roleId: number, moduleName: string, permissionName: string): Observable<any> {
    const role = this.rolesData.roles.find(r => r.role_id === roleId);
    if (role) {
      const module = role.modules.find(m => m.module_name === moduleName);
      if (module) {
        if (!module.permissions.some(p => p.permission_name === permissionName)) {
          module.permissions.push({ permission_name: permissionName });
          return of(module);
        }
      }
    }
    return of(null);
  }

  // Eliminar un permiso de un módulo dentro de un rol
  removePermissionFromModule(roleId: number, moduleName: string, permissionName: string): Observable<any> {
    const role = this.rolesData.roles.find(r => r.role_id === roleId);
    if (role) {
      const module = role.modules.find(m => m.module_name === moduleName);
      if (module) {
        const permissionIndex = module.permissions.findIndex(p => p.permission_name === permissionName);
        if (permissionIndex !== -1) {
          module.permissions.splice(permissionIndex, 1); // Elimina el permiso
          return of(module);
        }
      }
    }
    return of(null);
  }
// RoleService
removeModuleFromRole(roleId: number, moduleName: string): Observable<any> {
  const role = this.rolesData.roles.find(r => r.role_id === roleId);
  if (role) {
      const moduleIndex = role.modules.findIndex(m => m.module_name === moduleName);
      if (moduleIndex !== -1) {
          role.modules.splice(moduleIndex, 1);
          return of(role);
      }
  }
  return of(null);
}

  // Modificar un rol
  modifyRole(roleId: number, updatedRole: any): Observable<any> {
    const roleIndex = this.rolesData.roles.findIndex(r => r.role_id === roleId);
    if (roleIndex !== -1) {
      this.rolesData.roles[roleIndex] = { ...this.rolesData.roles[roleIndex], ...updatedRole };
      return of(this.rolesData.roles[roleIndex]);
    }
    return of(null);
  }

  // Eliminar un rol
  removeRole(roleId: number): Observable<any> {
    const roleIndex = this.rolesData.roles.findIndex(r => r.role_id === roleId);
    if (roleIndex !== -1) {
      this.rolesData.roles.splice(roleIndex, 1);
      return of({ role_id: roleId });
    }
    return of(null);
  }
}
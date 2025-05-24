 import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../services/roles.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css'],
})
export class PermisosComponent implements OnInit {
  permissions: any[] = [];
  isSidebarVisible = true;
  newPermission = { permissionName: '', description: '', moduleId: 1 };
  roles: any[] = [];
  selectedRoleId: number | null = null;
  selectedPermissions: number[] = [];
  isCreateModalOpen = false;
  isLoading = false;
  showSuccessModal = false;
  showErrorModal = false;
  isDeleting = false;
  showDeleteSuccessModal = false;
  showDeleteErrorModal = false;

  constructor(private rolesService: RolesService, private router: Router) {}

  ngOnInit(): void {
    this.fetchPermissions();
    this.fetchRoles();
  }

  goToRoles() {
    this.router.navigate(['/roles']);
  }

  // Obtener lista de permisos
  fetchPermissions() {
    this.rolesService.getPermissionsT().subscribe(
      (data) => {
        this.permissions = data;
      },
      (error) => {
        console.error('Error al obtener permisos:', error);
      }
    );
  }

  // Obtener lista de roles para asignación
  fetchRoles() {
    this.rolesService.getRoles().subscribe(
      (data) => {
        this.roles = data.map((role: any) => ({
          id: role.id,
          role_name: role.roleName,
          description: role.description,
          // Mapeamos cada permiso para cambiar "permissionName" por "permission_name"
          permissions: (role.permissions || []).map((perm: any) => ({
            id: perm.id,
            permission_name: perm.permissionName,
            description: perm.description,
            module: perm.module
          }))
        }));
      },
      (error) => {
        console.error('Error al obtener roles:', error);
      }
    );
  }

  // Eliminar un permiso con modales de carga y éxito/error
  deletePermission(id: number) {
    if (confirm('¿Estás seguro de eliminar este permiso?')) {
      this.isDeleting = true; // Mostrar modal de carga
  
      this.rolesService.deletePermissionFromRole(id).subscribe(
        (response) => {
          if (response.success) { // Verifica si el backend envía success: true
            console.log('✅ Permiso eliminado correctamente:', response);
            this.showDeleteSuccessModal = true;
          } else {
            console.error('❌ Respuesta inesperada:', response);
            this.showDeleteErrorModal = true;
          }
          this.isDeleting = false;
  
          setTimeout(() => {
            this.showDeleteSuccessModal = false;
            this.showDeleteErrorModal = false;
            this.fetchPermissions(); // Recargar lista de permisos
          }, 3000);
        },
        (error) => {
          console.error('❌ Error al eliminar permiso:', error);
          this.showDeleteErrorModal = true;
          this.isDeleting = false;
  
          setTimeout(() => {
            this.showDeleteSuccessModal = false;
            this.showDeleteErrorModal = false;
            this.fetchPermissions(); // Recargar lista de permisos
          }, 3000);
        }
      );
    }
  }  

  // Alternar selección de un permiso
  togglePermission(permissionId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedPermissions.push(permissionId); // Agregar si está seleccionado
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(id => id !== permissionId); // Quitar si se desmarca
    }

    console.log('Permisos seleccionados:', this.selectedPermissions); // Depuración
  }

  // Asignar permisos a un rol
  assignPermissionsToRole() {
    if (!this.selectedRoleId) {
      alert('Por favor, selecciona un rol.');
      return;
    }
  
    if (this.selectedPermissions.length === 0) {
      alert('Por favor, selecciona al menos un permiso.');
      return;
    }
  
    this.isLoading = true; // Mostrar modal de carga
  
    this.rolesService.updatePermissions(this.selectedRoleId, this.selectedPermissions).subscribe(
      (response) => {
        console.log('✅ Permisos asignados correctamente:', response);
        this.isLoading = false;
        this.showSuccessModal = true;
  
        setTimeout(() => {
          this.showSuccessModal = false;
          window.location.reload();
        }, 3000);
      },
      (error) => {
        if (error.status === 201) { // Si es 201, no es error
          console.log('✅ Permisos asignados correctamente.');
          this.showSuccessModal = true;
  
          setTimeout(() => {
            this.showSuccessModal = false;
            window.location.reload();
          }, 3000);
        } else {
          console.error('❌ Error al actualizar permisos:', error);
          this.isLoading = false;
          this.showErrorModal = true;
  
          setTimeout(() => {
            this.showErrorModal = false;
            window.location.reload();
          }, 3000);
        }
      }
    );
  }  

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrentUserStateService, ModuleData, PermissionData } from '../../../services/current-user-state.service';
import { RolesService } from '../../../services/roles.service';
import Swal from 'sweetalert2';

export interface PaginatedModule extends ModuleData {
  currentPermissionPage: number;
  totalPermissionPages: number;
  perPage: number;
  paginatedPermissions: PermissionData[];

}

@Component({
  selector: 'app-edit-permissions-modal',
  templateUrl: './edit-permissions-modal.component.html',
  styleUrls: ['./edit-permissions-modal.component.css']
})

export class EditPermissionsModalComponent {
  userPermissions: ModuleData[] = [];

  @Input() roleId!: number;
  @Input() userExistingPermissions: PermissionData[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  
  filtroModulo: string = '';
  filtroPermiso: string = '';
  currentPage = 1;
  pageSize = 3;
  totalPages = 1;
  paginatedModules: PaginatedModule[] = [];  // <-- mutable slice actual
  filteredModules: ModuleData[] = [];

  


  constructor(private currentUserService: CurrentUserStateService, private rolesService: RolesService) { }

  ngOnInit(): void {
    if (!this.roleId) {
      console.error('Role ID no definido');
      return;
    }

    this.currentUserService.getModulesWithPermissionsByRole(this.roleId).subscribe(response => {
      // 1. Guardamos los datos originales. No es necesario mapear aquí todavía.
      this.userPermissions = response.modules;

      // 2. Marcamos los permisos que el rol ya tiene.
      this.userPermissions.forEach(modulo => {
        modulo.permissions?.forEach(permiso => {
          permiso.assigned = this.userExistingPermissions.some(up => up.id === permiso.id);
        });
      });

      // 3. ¡CORREGIDO! Llamamos a applyFilters() UNA SOLA VEZ.
      // Este método se encargará de inicializar filteredModules y la paginación.
      this.applyFilters(); 
    });
  }

  applyFilters() {
    // Usamos .trim() para ignorar espacios en blanco al inicio o final
    const filtroModuloLower = this.filtroModulo.trim().toLowerCase();
    const filtroPermisoLower = this.filtroPermiso.trim().toLowerCase();

    let tempModules = [...this.userPermissions];

    // 1. Filtrar por nombre del módulo
    if (filtroModuloLower) {
      tempModules = tempModules.filter(modulo => {
        // <--- CÓDIGO MÁS SEGURO ---
        // Verificamos que 'moduleName' exista antes de intentar usarlo
        return modulo.moduleName ? modulo.moduleName.toLowerCase().includes(filtroModuloLower) : false;
      });
    }

    // 2. Filtrar por nombre del permiso
    if (filtroPermisoLower) {
      tempModules = tempModules
        .map(modulo => {
          // <--- CÓDIGO MÁS SEGURO ---
          // El '?' protege si 'permissions' es nulo o undefined
          const permisosCoincidentes = modulo.permissions?.filter(permiso => 
            // Verificamos que 'permissionName' exista
            permiso.permissionName ? permiso.permissionName.toLowerCase().includes(filtroPermisoLower) : false
          ) || []; // Si no hay permisos o ninguno coincide, devuelve un array vacío

          // Devolvemos una copia del módulo con solo los permisos que coinciden
          return { ...modulo, permissions: permisosCoincidentes };
        })
        // Finalmente, eliminamos los módulos que se quedaron sin permisos
        .filter(modulo => modulo.permissions && modulo.permissions.length > 0);
    }
    
    this.filteredModules = tempModules;
    this.currentPage = 1; 
    this.updatePagination();
  }

  // --- MODIFICADO: Ahora trabaja sobre filteredModules ---
  updatePagination() {
    // La paginación siempre se basará en la lista ya filtrada
    this.totalPages = Math.ceil(this.filteredModules.length / this.pageSize);
    
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const modulesSlice = this.filteredModules.slice(start, end);

    this.paginatedModules = this.toPaginatedModules(modulesSlice);
    this.inicializarPaginacionDePermisos(); // <-- Asegurarse de que los permisos paginados se reinicien
  }

  private toPaginatedModules(modules: ModuleData[]): PaginatedModule[] {
    return modules.map(modulo => ({
      ...modulo,
      currentPermissionPage: 1,
      totalPermissionPages: modulo.permissions ? Math.ceil(modulo.permissions.length / 9) : 0,
      perPage: 9,
      // Se pagina sobre la lista de permisos ya filtrada (si aplica)
      paginatedPermissions: modulo.permissions ? modulo.permissions.slice(0, 9) : []
    }));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }


  /*updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const modulesSlice = this.userPermissions.slice(start, end);
    this.paginatedModules = this.toPaginatedModules(modulesSlice);
  }

  private toPaginatedModules(modules: ModuleData[]): PaginatedModule[] {
    return modules.map(modulo => ({
      ...modulo,
      currentPermissionPage: 1,
      totalPermissionPages: modulo.permissions ? Math.ceil(modulo.permissions.length / 9) : 0,
      perPage: 9,
      paginatedPermissions: modulo.permissions ? modulo.permissions.slice(0, 9) : []
    }));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }*/

  inicializarPaginacionDePermisos() {
    this.paginatedModules.forEach(modulo => {
      modulo.currentPermissionPage = 1;
      modulo.perPage = 9;
      this.actualizarPermisosPaginados(modulo);
    });
  }

  actualizarPermisosPaginados(modulo: PaginatedModule) {
    if (!modulo.permissions) {
      modulo.paginatedPermissions = [];
      modulo.totalPermissionPages = 0;
      return;
    }

    const start = (modulo.currentPermissionPage - 1) * modulo.perPage;
    const end = start + modulo.perPage;
    modulo.totalPermissionPages = Math.ceil(modulo.permissions.length / modulo.perPage);
    modulo.paginatedPermissions = modulo.permissions.slice(start, end);
  }

  prevPermissionPage(modulo: PaginatedModule) {
    if (modulo.currentPermissionPage > 1) {
      modulo.currentPermissionPage--;
      this.actualizarPermisosPaginados(modulo);
    }
  }

  nextPermissionPage(modulo: PaginatedModule) {
    if (modulo.currentPermissionPage < modulo.totalPermissionPages) {
      modulo.currentPermissionPage++;
      this.actualizarPermisosPaginados(modulo);
    }
  }

  onClose() {
    this.close.emit();
  }

  /*saveChanges() {
    this.save.emit(this.userPermissions);
  }*/

  saveChanges() {
    if (!this.roleId) {
      console.error('No se puede guardar sin un ID de rol.');
      return;
    }

    // Paso A: Recolecta los IDs de TODOS los permisos marcados como 'assigned'
    const selectedPermissionIds = this.userPermissions
      .flatMap(modulo => modulo.permissions || []) // Aplana todos los permisos en un solo array
      .filter(permiso => permiso.assigned)        // Filtra solo los que están seleccionados
      .map(permiso => permiso.id);                 // Extrae solo sus IDs
    
    // Paso B: Llama al servicio para actualizar los permisos
    this.rolesService.updatePermissions(this.roleId, selectedPermissionIds).subscribe({
      next: (response) => {
        console.log('✅ Permisos actualizados correctamente:', response);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Los permisos se han actualizado para el rol correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Paso C: Notifica al componente padre que el guardado fue exitoso
        this.save.emit(this.userPermissions);
        this.onClose(); // Cierra el modal después de guardar
      },
      error: (error) => {
        console.error('❌ Error al actualizar permisos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: 'Ocurrió un problema al intentar actualizar los permisos.',
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }
}
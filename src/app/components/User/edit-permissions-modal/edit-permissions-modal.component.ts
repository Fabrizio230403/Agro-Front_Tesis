import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrentUserStateService, ModuleData, PermissionData } from '../../../services/current-user-state.service';

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
  @Output() save = new EventEmitter<ModuleData[]>();
  
  filtroModulo: string = '';
  filtroPermiso: string = '';
  currentPage = 1;
  pageSize = 3;
  totalPages = 1;
  paginatedModules: PaginatedModule[] = [];  // <-- mutable slice actual


  constructor(private currentUserService: CurrentUserStateService) { }

  ngOnInit(): void {
    if (!this.roleId) {
      console.error('Role ID no definido');
      return;
    }

    this.currentUserService.getModulesWithPermissionsByRole(this.roleId).subscribe(response => {
      // Convertir todos a PaginatedModule y marcar permisos asignados
      this.userPermissions = response.modules.map(modulo => ({
        ...modulo,
        currentPermissionPage: 1,
        totalPermissionPages: modulo.permissions ? Math.ceil(modulo.permissions.length / 9) : 0,
        perPage: 9,
        paginatedPermissions: modulo.permissions ? modulo.permissions.slice(0, 9) : []
      }));

      this.userPermissions.forEach(modulo => {
        modulo.permissions?.forEach(permiso => {
          permiso.assigned = this.userExistingPermissions.some(up => up.id === permiso.id);
        });
      });

      this.totalPages = Math.ceil(this.userPermissions.length / this.pageSize);
      this.updatePagination();  // <-- actualizar la paginacion inicial
      this.inicializarPaginacionDePermisos();  // <-- inicializar paginacion permisos por modulo
    });
  }


  updatePagination() {
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
  }

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

  saveChanges() {
    this.save.emit(this.userPermissions);
  }
}
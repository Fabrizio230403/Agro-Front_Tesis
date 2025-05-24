import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CurrentUserStateService, UserData, ModuleData } from '../../../services/current-user-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  isSidebarVisible = true;
  user: UserData | any = null;
  users: UserData[] = [];
  loading: boolean = false;
  editingUser: any | null = null;
  userToDelete: any | null = null;
  isAddingUser: boolean = false;
  userRolesPermissions: any | null = null;
  modulesWithPermissions: ModuleData[] = [];


  currentPage: number = 1;
  itemsPerPage: number = 2;

  showPasswordModal: boolean = false;
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  actualizarPassword() {
  if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
    Swal.fire('Error', 'Completa todos los campos.', 'error');
    return;
  }
  
  if (this.newPassword !== this.confirmPassword) {
    Swal.fire('Error', 'La nueva contraseña no coincide con la confirmación.', 'error');
    return;
  }
  
  if (!this.user || !this.user.id) {
    Swal.fire('Error', 'Usuario no identificado.', 'error');
    return;
  }

  const cambioPassPayload = {
    oldPassword: this.oldPassword,
    newPassword: this.newPassword,
  };

  this.userService.cambiarPassword(this.user.id, cambioPassPayload).subscribe({
    next: () => {
      Swal.fire('¡Éxito!', 'Contraseña actualizada correctamente.', 'success');
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.showPasswordModal = false;
    },
    error: (error) => {
      if (error.status === 400) {
        Swal.fire('Error', error.error, 'error');
      } else if (error.status === 404) {
        Swal.fire('Error', 'Usuario no encontrado.', 'error');
      } else {
        Swal.fire('Error', 'Error al actualizar la contraseña.', 'error');
      }
      console.error(error);
    }
  });
}

  get totalPages(): number {
    return Math.ceil(this.modulesWithPermissions.length / this.itemsPerPage);
  }

  get paginatedModules(): ModuleData[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.modulesWithPermissions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  constructor(private userService: UserService, private currentUserStateService: CurrentUserStateService) { }

  ngOnInit(): void {
    this.loadUser();
  }


  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getMyUser().subscribe({
      next: (userData: UserData | any) => {
        this.user = userData;
        this.loading = false;

        // Cuando ya tenemos el rol, buscamos módulos y permisos agrupados
        if (userData?.rol?.id) {
          this.currentUserStateService.getModulesWithPermissionsByRole(userData.rol.id).subscribe({
            next: (response) => {
              this.modulesWithPermissions = response.modules; // Guarda los módulos con sus permisos
            },
            error: (error) => {
              console.error('Error al obtener los módulos y permisos:', error);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  openAddUserModal(): void {
    this.isAddingUser = true;
  }

  handleUserAdded(newUser: any): void {
    this.users.push(newUser);
    this.isAddingUser = false;
  }

  handleEditUser(user: UserData): void {
    this.editingUser = { ...user };
  }

  handleUserUpdated(updatedUser: UserData): void {
    const index = this.user;
    if (index !== -1) {
      const existingUser = this.user;
      this.user = {
        ...existingUser,
        ...updatedUser

      };


      console.log('handleUserUpdated - User in array after update:', JSON.stringify(this.user, null, 2)); // Verifica el resultado

      this.currentUserStateService.setUser(this.user);

    }
    this.loadUser();
    this.editingUser = null;
  }

  handleDeleteUser(user: any): void {
    this.userToDelete = user;
  }

  handleUserDeleted(deletedUser: any): void {
    this.users = this.users.filter(user => user.id !== deletedUser.id);
    this.userToDelete = null;
  }

  // Roles and Permissions handlers
  // Método para ver roles y permisos
  viewRolesPermissions(user: UserData): void {
    this.userRolesPermissions = {
      username: user.username,
      rol: user.rol || null,
      permissions: user?.rol?.permissions || []
    };
  }
  // Método para cerrar el modal
  closeRolesModal(): void {
    this.userRolesPermissions = null;
  }


}
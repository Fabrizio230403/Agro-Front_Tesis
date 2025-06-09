import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CurrentUserStateService, UserData, RoleData, PermissionData, ModuleData } from '../../../services/current-user-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  isSidebarVisible = true;
  users: UserData[] = [];
  roles: RoleData[] = [];  // Lista de roles
  loading: boolean = false;
  editingUser: any | null = null;
  userToDelete: any | null = null;
  isAddingUser: boolean = false;
  userRolesPermissions: any | null = null;

  selectedRoleId!: number;
  selectedUserPermissions: PermissionData[] = [];
  showEditPermissionsModal = false;

  showEditRoleModal = false;
  selectedUserRole!: RoleData;
  userIdEditingRole!: number;

  openEditRoleModal(userId: number, role: RoleData) {
    this.userIdEditingRole = userId;
    this.selectedUserRole = role;
    this.showEditRoleModal = true;
  }


  handleSaveRole(newRoleId: number) {
    // Aquí puedes hacer una petición al backend para guardar el nuevo rol
    const user = this.users.find(u => u.id === this.userIdEditingRole);
    const newRole = this.roles.find(r => r.id === newRoleId);

    if (user && newRole) {
      user.rol = newRole;
      this.syncFilteredUsers(); // Actualiza la vista
    }

    this.showEditRoleModal = false;
  }

  handleBackFromEditRole() {
    // Lógica para volver al modal anterior o cambiar vistas
    // Por ejemplo:
    this.showEditRoleModal = false;
    // show otro modal o cualquier lógica que tengas para "volver"
  }

  openEditPermissionsModal(roleId: number, permissions: PermissionData[]) {
    this.selectedRoleId = roleId;
    this.selectedUserPermissions = permissions;
    this.showEditPermissionsModal = true;
  }

  handleSavePermissions(updatedModules: ModuleData[]) {
    // Aquí podrías actualizar el usuario localmente o refrescar permisos
    console.log('Permisos actualizados recibidos del modal:', updatedModules);
    this.showEditPermissionsModal = false;
    this.userRolesPermissions = false;
    this.loadUsers();
    this.loadRoles();

    // Opcional: actualizar los permisos en el backend o en el usuario actual
  }

  // Propiedades para el filtrado
  filtroCampo: string = '';  // Campo de filtro, puede ser 'username', 'email', 'telefono', 'role', etc.
  filtroTermino: string = '';  // Término de búsqueda
  currentPage: number = 1;  // Página actual para paginación
  usersFiltrados: UserData[] = [];  // Array para usuarios filtrados


  constructor(private userService: UserService, private currentUserStateService: CurrentUserStateService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();  // Cargar roles al inicializar el componente
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  onCampoFiltroChange(): void {
    this.filtroTermino = '';
    this.filtrarUsuarios(); // Aplicar filtro con término vacío
  }

  filtrarUsuarios(): void {
    if (!this.filtroCampo || this.filtroTermino.trim() === '') {
      this.usersFiltrados = [...this.users];  // Si no hay filtro, mostrar todos los usuarios
      return;
    }

    // Validación para el campo telefono, si no es numérico se muestra un modal
    if (this.filtroCampo === 'telefono' && !/^\d+$/.test(this.filtroTermino.trim())) {
      this.usersFiltrados = this.users;  // Mantener los usuarios sin aplicar el filtro
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa solo números para el filtro de teléfono.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const termino = this.filtroTermino.toLowerCase().trim();
    this.currentPage = 1;

    this.usersFiltrados = this.users.filter((usuario) => {
      switch (this.filtroCampo) {
        case 'username':
          return usuario.username?.toLowerCase().includes(termino);
        case 'email':
          return usuario.email?.toLowerCase().includes(termino);
        case 'telefono':
          return usuario.telefono?.toLowerCase().includes(termino);
        case 'role':
          return usuario.rol?.roleName?.toLowerCase().includes(termino);  // Filtrar por rol
        default:
          return false;
      }
    });
  }

  // Validación de input
  validateInput(event: any): void {
    const inputValue = event.target.value;
    if (this.filtroCampo === 'telefono') {
      // Evita ingresar letras si el campo es 'telefono'
      if (!/^\d+$/.test(inputValue)) {
        event.target.value = inputValue.replace(/[^0-9]/g, '');  // Solo números
      }
    }
  }


  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data: UserData[]) => {
        this.users = data;
        this.usersFiltrados = [...this.users];  // Inicialmente, mostrar todos los usuarios
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
        alert('There was an error loading the users. Please try again later.');
      }
    });
  }

  loadRoles(): void {
    this.currentUserStateService.getRoles().subscribe((data: RoleData[]) => {
      this.roles = data;  // Cargar los roles desde el servicio
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
    console.log('handleUserUpdated - Received data:', JSON.stringify(updatedUser, null, 2));

    const index = this.users.findIndex((user: UserData) => user.id === updatedUser.id);

    if (index !== -1) {
      const existingUser = this.users[index];
      this.users[index] = {
        ...existingUser,
        ...updatedUser
      };

      const currentUserId = this.currentUserStateService.getUser()?.id;
      if (updatedUser.id === currentUserId) {
        this.currentUserStateService.setUser(this.users[index]);
      }

      this.syncFilteredUsers();

    } else {
      console.warn(`User with ID ${updatedUser.id} not found in the local array.`);
    }
    this.loadUsers();
    this.loadRoles();
    this.editingUser = null;
  }

  private syncFilteredUsers(): void {
    this.usersFiltrados = [...this.users];
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
  viewRolesPermissions(user: any): void {
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
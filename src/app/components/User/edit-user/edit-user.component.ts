import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { PermissionData, ModuleData } from '../../../services/current-user-state.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html'
})


export class EditUserComponent {
  @Input() user: any;
  @Output() userUpdated = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  showDetails: boolean = false; // Nueva propiedad
  showEditPermissionsModal = false;
  selectedRoleId: number = 1; // o el id real del rol seleccionado
  selectedUserPermissions: PermissionData[] = [];

  constructor(private userService: UserService) { }

  updateUser(event?: Event): void {
    if (event) event.preventDefault(); // Evitar submit por defecto

    this.userService.updateUser(this.user).subscribe({
      next: (data) => {
        this.userUpdated.emit(data);
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'La información del usuario ha sido actualizada correctamente.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        });
      },
      error: (err) => {
        console.error('Error updating user:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'Ocurrió un problema al intentar actualizar el usuario.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }

  openEditPermissionsModal(roleId: number | undefined, existingPermissions: PermissionData[] | undefined) {
    if (!roleId || !existingPermissions) {
      console.warn('No se puede abrir el modal porque roleId o permisos no están definidos');
      return;
    }
    this.selectedRoleId = roleId;
    this.selectedUserPermissions = existingPermissions;
    this.showEditPermissionsModal = true;
  }

  handleSavePermissions(updatedModules: ModuleData[]) {
    // Aquí podrías actualizar el usuario localmente o refrescar permisos
    console.log('Permisos actualizados recibidos del modal:', updatedModules);
    this.showEditPermissionsModal = false;

    // Opcional: actualizar los permisos en el backend o en el usuario actual
  }

  cancelEdit(): void {
    this.cancel.emit();
  }

  // ✅ Método para abrir el modal de permisos
  openPermissionsModal() {
    console.log('Abriendo edición de permisos para:', this.user);
    // Aquí puedes abrir otro modal o componente
  }

  viewUserDetails() {
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
  }

  handleBackFromDetails() {
    this.showDetails = false;
    // Aquí puedes reabrir el modal anterior, si está oculto.
    // Por ejemplo, si tienes una variable showEditModal, ponla true.
    // this.showEditModal = true;
  }
}


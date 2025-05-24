import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-permission',
  templateUrl: './create-permission.component.html',
  styleUrls: ['./create-permission.component.scss']
})
export class CreatePermissionComponent {
  permissionName: string = '';
  permissionDescription: string = '';

  onSubmit() {
    if (this.permissionName && this.permissionDescription) {
      // Aquí agregar lógica para crear el permiso, por ejemplo, llamar a un servicio
      console.log('Permiso creado:', this.permissionName, this.permissionDescription);
    }
  }
}
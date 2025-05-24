import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoleData } from '../../../services/current-user-state.service';
@Component({
  selector: 'app-edit-role-modal',
  templateUrl: './edit-role-modal.component.html',
  styleUrl: './edit-role-modal.component.css'
})
export class EditRoleModalComponent {
  @Input() currentRole!: RoleData;
  @Input() allRoles: RoleData[] = [];

  @Output() close = new EventEmitter<void>(); // Solo uno para cerrar
  @Output() save = new EventEmitter<number>();
  @Output() backToPrevious = new EventEmitter<void>(); // para retroceder modal si es necesario

  selectedRoleId!: number;
  description: string = '';


  ngOnInit() {
    this.selectedRoleId = this.currentRole?.id;
    this.description = this.currentRole?.description ?? '';
  }

  onRoleChange(roleId: string | number) {
    const id = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
    const selectedRole = this.allRoles.find(role => role.id === id);
    this.description = selectedRole?.description ?? '';
  }

  onSave() {
    this.save.emit(this.selectedRoleId);
  }

  onClose() {
    this.close.emit();  // Emitir close, no closeModal
  }

  onBack() {
    this.backToPrevious.emit();
  }

}
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']
})
export class CreateRoleComponent {
  @Input() isModalOpen: boolean = false;
  @Input() modalType: string = 'role';
  @Input() modalData: any = {};

  @Output() closeModal: EventEmitter<void> = new EventEmitter();
  @Output() saveModal: EventEmitter<any> = new EventEmitter();

  close() {
    this.closeModal.emit();
  }

  save() {
    this.saveModal.emit(this.modalData);
    this.close(); // Optionally close after saving
  }

  get modalTitle() {
    if (this.modalType === 'role') return 'Crear Rol';
    if (this.modalType === 'module') return 'Agregar Módulo';
    return 'Agregar Permiso';
  }

  get modalPlaceholder() {
    if (this.modalType === 'role') return 'Nombre del Rol';
    if (this.modalType === 'module') return 'Nombre del Módulo';
    return 'Nombre del Permiso';
  }
}

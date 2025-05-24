import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
})
export class RoleDetailComponent {
  @Input() role: any; 
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}

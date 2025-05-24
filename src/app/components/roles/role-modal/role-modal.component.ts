// role-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface RoleDetail {
  name: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-role-modal',
  templateUrl: './role-modal.component.html'
})
export class RoleModalComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();

  readonly roleDescriptions: { [key: string]: RoleDetail } = {
    'Admin': {
      name: 'Administrator',
      description: 'Full system access with complete control over users, settings, and system configurations.',
      permissions: ['View', 'Create', 'Edit', 'Delete']
    },
    'User': {
      name: 'Standard User',
      description: 'Basic access to assigned modules with limited permissions based on role configuration.',
      permissions: ['View', 'Create']
    }
  };

  getRoleDetails(): RoleDetail[] {
    return this.user?.roles?.map((role: string) => ({
      ...this.roleDescriptions[role],
      permissions: this.user.permissions
    })) || [];
  }

  closeModal(): void {
    this.close.emit();
  }
}
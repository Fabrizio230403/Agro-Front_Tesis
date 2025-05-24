// assign-permissions.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../role.service';

@Component({
  selector: 'app-assign-permissions',
  templateUrl: './assign-permissions.component.html',
  styleUrls: ['./assign-permissions.component.css']
})
export class AssignPermissionsComponent implements OnInit {
openCreateRoleModal() {
throw new Error('Method not implemented.');
}
  isPermissionModalOpen = false;
  isCreatePermissionModalOpen = false;
  isCreateRoleModalOpen = false;
  rolesData: any[] = [];
  permissionForm: FormGroup;
  roleForm: FormGroup;
  searchCategory: string = '';
  searchPermission: string = '';
  selectedRoleModules: any[] = [];
  selectedRoleId: number | null = null;
  selectedModuleName: string | null = null;

  constructor(private roleService: RoleService, private fb: FormBuilder) {
    this.permissionForm = this.fb.group({
      permissionName: ['', Validators.required],
      permissionDescription: ['', Validators.required],
    });
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      roleDescription: ['', Validators.required],
      selectedRole: ['', Validators.required],
      selectedModule: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe(data => {
      this.rolesData = data;
    });
  }

  editRole(roleId: number): void {
    // Implementar lógica de edición
    console.log('Editar rol:', roleId);
  }

  deleteRole(roleId: number): void {
    this.roleService.removeRole(roleId).subscribe(() => {
      this.loadRoles();
    });
  }

  openSettings(roleId: number): void {
    this.selectedRoleId = roleId;
    this.openPermissionModal();
  }
  openPermissionModal() {
    throw new Error('Method not implemented.');
  }

  // ... mantener los demás métodos existentes
}
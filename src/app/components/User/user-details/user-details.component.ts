import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrentUserStateService, ModuleData, PermissionData } from '../../../services/current-user-state.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent {
  @Input() user: any; // Usa any si no tienes un modelo definido
  @Output() close = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  allModules: ModuleData[] = [];
  currentPage = 1;
  pageSize = 3;

  constructor(private userService: CurrentUserStateService) { }

  ngOnInit() {
    if (this.user && this.user.rol && this.user.rol.id) {
      this.loadModulesWithPermissions(this.user.rol.id);
    }
  }

  loadModulesWithPermissions(roleId: number) {
    this.userService.getModulesWithPermissionsByRole(roleId).subscribe({
      next: (response) => {
        this.allModules = response.modules;
      },
      error: (err) => {
        console.error('Error cargando módulos y permisos', err);
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.allModules.length / this.pageSize);
  }

  get paginatedModules() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allModules.slice(start, start + this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onClose() {
    this.close.emit();
  }

  onBack() {
    this.back.emit();
  }

}
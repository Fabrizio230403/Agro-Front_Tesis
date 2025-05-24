import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html'
})
export class DeleteUserComponent {
  @Input() user: any;
  @Output() userDeleted = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private userService: UserService) {}

  deleteUser(): void {
    if (this.user) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          this.userDeleted.emit(this.user);
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  cancelDelete(): void {
    this.cancel.emit();
  }
}
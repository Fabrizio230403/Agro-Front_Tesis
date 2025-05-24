import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html'
})
export class AddUserComponent {
  @Output() userAdded = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  newUser = {
    username: '',
    email: '',
    phone: '',
    status: 'Active',
    photo: '',
    roles: [],
    modules: []
  };

  constructor(private userService: UserService) {}

  addUser(): void {
    if (this.validateNewUser()) {
      this.userService.addUser(this.newUser).subscribe({
        next: (data) => {
          this.userAdded.emit(data);
          this.resetForm();
        },
        error: (err) => {
          console.error('Error adding user:', err);
        }
      });
    }
  }

  validateNewUser(): boolean {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.phone) {
      alert('Please complete all fields.');
      return false;
    }
    return true;
  }

  cancelAdd(): void {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.newUser = {
      username: '',
      email: '',
      phone: '',
      status: 'Active',
      photo: '',
      roles: [],
      modules: []
    };
  }
}
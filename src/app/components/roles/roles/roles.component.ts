import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-roles',
  template: `
    <div class="roles-container">
      <h2>User Roles and Permissions</h2>
      <div *ngIf="rolesAndPermissions" class="roles-content">
        <pre>{{ rolesAndPermissions }}</pre>
      </div>
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .roles-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .roles-content {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
    }
    .error-message {
      color: red;
    }
  `]
})
export class RolesComponent implements OnInit {
  rolesAndPermissions: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


}
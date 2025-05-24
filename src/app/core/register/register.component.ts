import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = {
    username: '',
    email: '',
    password: '',
    enabled: 1,
  };
  confirmPassword = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  apiEndpoint = environment.apiEndpoint;

  constructor(private http: HttpClient, private router: Router) {}

  togglePasswordVisibility(fieldId: string, iconId: string) {
    const field = document.getElementById(fieldId) as HTMLInputElement;
    const icon = document.getElementById(iconId) as HTMLElement;

    if (field.type === 'password') {
      field.type = 'text';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      field.type = 'password';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  }

  get passwordsDontMatch(): boolean {
    return this.user.password !== this.confirmPassword;
  }

 onRegister() {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.passwordsDontMatch) {
    this.errorMessage = 'Las contraseñas no coinciden.';
    return;
  }

  this.http
    .post(this.apiEndpoint, this.user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text',
      withCredentials: true,
    })
    .subscribe({
      next: (response: string) => {
        if (response.includes('Usuario registrado exitosamente')) {
          this.successMessage = 'Registro exitoso.';
          this.errorMessage = null;

          window.alert('Registro exitoso. Serás redirigido al dashboard.');
          this.router.navigate(['/dashboard']);
        } else {
          this.handleError('Usuario no encontrado o error en los datos');
        }
      },
      error: (error) => {
        console.error('Error en la petición:', error);
        this.handleError(
          'Error al intentar registrarte. Por favor, intenta de nuevo.'
        );
      },
    });
}


  private handleError(message: string) {
    this.errorMessage = message;
    this.successMessage = null;
  }
}

import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { CurrentUserStateService, UserData } from '../../services/current-user-state.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData = {
    username: '',
    password: '',
    rememberMe: false,
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  

  constructor(private http: HttpClient, private router: Router, private currentUserState: CurrentUserStateService, private userService: UserService) {}

  onSubmit() {
    this.loading = true;
    const formData = new URLSearchParams();
    formData.append('username', this.loginData.username);
    formData.append('password', this.loginData.password);
    this.currentUserState.clearUser();
    this.http.post(
        'http://localhost:8091/login',
        formData.toString(),
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
          withCredentials: true,
          responseType: 'text',
        }
      )
      .subscribe({
        next: (response: string) => {
          if (response.includes('Login successful')) {
            localStorage.setItem('token', 'some-auth-token'); // Simulación de token
            this.successMessage = 'Inicio de sesión exitoso.';

            this.userService.getMyUser().subscribe({ // <-- Subscribe to getMyUser HERE
              next: (userData: UserData | any) => { // Type according to getMyUser's return
                if (userData) {
                  console.log('User details fetched:', userData);
                  this.currentUserState.setUser(userData); // <-- STORE USER DATA
                  this.successMessage = 'Inicio de sesión exitoso. Datos cargados.'; // Update success message
                  this.errorMessage = null;
                  this.loading = false; // Turn off loading ONLY after user data is processed
                  this.router.navigate(['/dashboard']); // <-- Navigate after storing data
                } else {
                  // Handle case where login was ok, but getMyUser didn't return data
                   console.warn('Login successful, but getMyUser returned no data.');
                   this.handleError('Login exitoso, pero no se pudieron obtener los detalles del usuario.');
                   this.loading = false;
                   // Decide whether to navigate anyway
                   // this.router.navigate(['/dashboard']);
                }
              },
              error: (userError) => {
                // Handle error specifically from getMyUser
                console.error('Error fetching user details after successful login:', userError);
                this.handleError('Login exitoso, pero falló la carga de detalles del usuario.');
                this.loading = false;
                // Decide whether to navigate anyway
                // this.router.navigate(['/dashboard']);
              }
            });

            this.errorMessage = null;
            this.router.navigate(['/dashboard']);
          } else {
            this.handleError('Usuario no encontrado o error en los datos');
          }
        },
        error: (error) => {
          console.error('Error en la petición:', error);
          this.handleError('Error al intentar iniciar sesión. Por favor, intente de nuevo.');
        },
      });
  }


  private handleError(message: string) {
    this.errorMessage = message;
    this.successMessage = null;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface CustomTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface TokenRequestBody {
  previousRefreshToken?: string | null; // El token que se obtuvo la última vez
  // Otros parámetros que tu backend pueda necesitar para este flujo
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login() {
    this.isAuthenticated = true; 
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('token'); 
  }

  getTokenForApi(): Observable<string | null> {
    const previousToken = localStorage.getItem(this.tokenKey);

    // Prepara el cuerpo de la petición para tu endpoint /token.
    // Esto es una suposición, DEBES AJUSTARLO a lo que tu backend espera.
    const requestBody: TokenRequestBody = {
      previousRefreshToken: previousToken,
    };

    // Prepara los headers. Si tu endpoint /token requiere autenticación de cliente (Basic Auth):
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json', // O 'application/x-www-form-urlencoded' si tu backend lo espera así
      // Ejemplo si se requiere Basic Auth para el cliente 'oidc-client'
      // 'Authorization': 'Basic ' + btoa('oidc-client:secret')
    });

    console.log('AuthService: Calling /token with body:', requestBody);

    return this.http.post<CustomTokenResponse>('http://localhost:8091/token', requestBody, { headers: httpHeaders, withCredentials: true })
      .pipe(
        tap((response: CustomTokenResponse) => {
          // Guarda el "siguiente token de refresco" para la próxima vez.
          if (response && response.refreshToken) {
            localStorage.setItem(this.tokenKey, response.refreshToken);
            console.log('AuthService: New token stored for next refresh:', response.refreshToken);
          } else {
            // Si no viene un nextRefreshTokenToStore, ¿qué hacemos? ¿Quizás el bearerToken es el que se reusa?
            // Esto depende de tu diseño. Por seguridad, los refresh tokens suelen rotar.
            console.warn('AuthService: No "nextRefreshTokenToStore" received in response from /token.');
          }
        }),
        map((response: CustomTokenResponse) => {
          // Devuelve el "bearerToken" que se usará en el header de la API.
          if (response && response.refreshToken) {
            console.log('AuthService: Bearer token to be used for API:', response.refreshToken);
            return response.refreshToken;
          }
          console.error('AuthService: No "bearerToken" received in response from /token.');
          return null; // O lanzar un error si el bearerToken es mandatorio
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('AuthService: Error fetching/refreshing token from /token:', error);
          if (error.status === 401 || error.status === 403) { // Si el /token devuelve 401/403 (ej. refresh token inválido)
            this.logout(); // Considera esto un fallo de autenticación y desloguea
          }
          return of(null); // Devuelve null para que el interceptor maneje la ausencia de token
        })
      );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated || !!localStorage.getItem('token');
  }
}

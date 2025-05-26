import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
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

  fetchTokenFromServer(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('http://localhost:8091/token', {}, { withCredentials: true })  // Ajusta el body si es necesario
      .pipe(
        tap(response => {
          if (response?.refreshToken) {
            localStorage.setItem(this.tokenKey, response.refreshToken);
            console.log('Token en storage:', response.refreshToken); // <- Dentro del if
          }
        })
      );
  }

  getToken(): Observable<string | null> {
    return this.fetchTokenFromServer().pipe(
      map(response => response.refreshToken), // o accessToken si es el que debes usar
      tap(token => {
        if (token) {
          localStorage.setItem(this.tokenKey, token);
        }
      }),
      catchError(() => of(null))
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated || !!localStorage.getItem('token');
  }
}

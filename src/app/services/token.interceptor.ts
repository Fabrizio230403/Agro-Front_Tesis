import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Excluir la llamada al endpoint /token del interceptor
    // Asegúrate de que esto coincide con la URL exacta de tu AuthService.getTokenForApi()
    if (req.url.includes('http://localhost:8091/token')) {
      return next.handle(req);
    }

    // Llama a getTokenForApi() para obtener el token que se usará en el header Bearer.
    // Esta llamada contactará a tu backend para obtener/refrescar el token.
    return this.authService.getTokenForApi().pipe(
      switchMap(bearerToken => {
        if (bearerToken) {
          console.log('TokenInterceptor: Attaching token to API request:', bearerToken);
          const cloned = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + bearerToken)
          });
          return next.handle(cloned);
        }
        // Si no se obtuvo un bearerToken (getTokenForApi devolvió null),
        // enviar la petición original sin token.
        // El backend debería devolver 401 si la ruta está protegida.
        console.warn('TokenInterceptor: No bearer token available. Sending request without Authorization header.');
        return next.handle(req);
      }),
      catchError((error: HttpErrorResponse) => {
        // Este catchError aquí es para errores que ocurren DESPUÉS de que getTokenForApi
        // ya se resolvió (o falló y devolvió null) y la petición API fue enviada.
        // Si la petición API (con o sin token) devuelve 401, podría ser una señal para desloguear.
        // Sin embargo, getTokenForApi ya tiene su propio catchError que podría haber llamado a logout().
        if (error.status === 401) {
          console.error('TokenInterceptor: API request resulted in 401. Logging out.');
          this.authService.logout();
          // Podrías querer redirigir a la página de login aquí.
          // this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
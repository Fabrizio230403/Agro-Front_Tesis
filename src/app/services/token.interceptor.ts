// token.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Excluir la llamada al endpoint /token del interceptor
    if (req.url.includes('/token')) {
      return next.handle(req);
    }

    return this.authService.getToken().pipe(
      switchMap(token => {
        console.log('Token enviado:', token);

        if (token) {
          const cloned = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token)
          });
          return next.handle(cloned);
        }

        return next.handle(req);
      })
    );
  }
}

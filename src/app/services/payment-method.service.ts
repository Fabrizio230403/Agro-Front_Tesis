import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private apiUrl = 'http://localhost:8091/api/payment-methods'; 

  constructor(private http: HttpClient) {}

  obtenerMetodosDePago() {
    return this.http.get<any[]>(this.apiUrl, {withCredentials: true});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = 'http://localhost:8091/api/customers'; // URL API en Azure

  // private apiUrl = 'http://localhost:81/api/clientes';  // Cambiar a URL local de la API

  constructor(private http: HttpClient) { }

  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl, {withCredentials: true});
  }

  obtenerClientePorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`, {withCredentials: true});
  }

  guardarCliente(cliente: Cliente): Observable<any> {
    return this.http.post<any>(this.apiUrl, cliente, { responseType: 'text' as 'json', withCredentials: true});
  }

  actualizarCliente(id: number, cliente: Cliente): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}`, cliente, { responseType: 'text' as 'json', withCredentials: true});
  }

  eliminarCliente(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text', withCredentials: true});
  }

  getClientePorDni(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/buscar/${dni}`, { withCredentials: true });
  }
  
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
}) 
export class ReportesService {
  //private baseUrl = 'https://api-agroinversiones-gzdgf3cydydde6gm.canadacentral-01.azurewebsites.net/api/reports';

  private baseUrl = 'http://localhost:8091/api/reports';

  constructor(private http: HttpClient) {}

  private getOptions() {
    return {
      withCredentials: true // Permite enviar cookies con la solicitud
    };
  }

  getReporteVentas(date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ventas/${date}`, this.getOptions());
  }

  getReporteProveedores(filter: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/proveedores/${filter}`, this.getOptions());
  }

  getReporteInventario(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventario`, this.getOptions());
  }

  getReporteGraficos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/graficos`, this.getOptions());
  }

  getReporteGraficosDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/graficosDashboard`, this.getOptions());
  }

  getReporteFinanzas(date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/finanzas/${date}`, this.getOptions());
  }

  getReporteClientes(filter: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes/${filter}`, this.getOptions());
  }
  

}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface InvoiceItem {
  unidadDeMedida: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  precioUnitario: number;
  subtotal: number;
  igv: number;
  total: number;
}

export interface InvoiceRequest {
  tipoDeComprobante: number;
  serie: string;
  sunatTransaction?: number; // si aplica
  clienteTipoDocumento: string;
  clienteNumeroDeDocumento: string;
  clienteDenominacion: string;
  clienteDireccion: string;
  fechaDeEmision: string;
  moneda: number;
  porcentajeDeIgv: number;
  totalGravada: number;
  totalIgv: number;
  total: number;
  items: InvoiceItem[];
  paymentMethod: number;
  operationNumber?: string; // Agregado para evitar error
  cuotas: number;  // Asegúrate de incluir este campo
}

export interface InvoiceResponse {
  tipoDeComprobante: number;
  serie: string;
  numero: number; // O string si el número puede tener ceros a la izquierda y es tratado como tal
  enlace: string;
  aceptadaPorSunat: boolean;
  enlaceDelPdf: string;
  enlaceDelXml: string;
  enlaceDelCdr: string;
  error?: string; // Optional
  tipo: string; // 'Factura', 'Boleta', etc.
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8091/api/invoice/enviar';
  private numeroFacturaUrl = 'http://localhost:8091/api/numeroFactura'; // Endpoint para obtener el número de factura


  constructor(private http: HttpClient) {}

  enviarFactura(invoice: InvoiceRequest): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers: headers, withCredentials: true };

    return this.http.post<any>(this.apiUrl, invoice, options);
  }

  
  obtenerNumeroFactura(tipo: string): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers: headers, withCredentials: true };
    return this.http.get<string>(`${this.numeroFacturaUrl}?tipo=${tipo}`, options);
  }

  
}

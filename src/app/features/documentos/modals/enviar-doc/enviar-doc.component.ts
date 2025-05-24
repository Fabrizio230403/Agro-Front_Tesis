 import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-enviar-doc',
  templateUrl: './enviar-doc.component.html',
  styleUrls: ['./enviar-doc.component.css'],
})
export class EnviarDocComponent {
  @Input() documento: any; // Documento a enviar
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() enviarDocumento = new EventEmitter<any>();

  formularioActivo: string | null = null; // Estado para mostrar formularios
  mensaje: string = ''; // Mensaje compartido entre formularios
  correo: string = ''; // Correo electrónico para Gmail
  asunto: string = ''; // Asunto para Gmail
  telefono: string = ''; // Número de celular para SMS

  mostrarFormulario(tipo: string) {
    this.formularioActivo = tipo;
    this.mensaje = this.getMensaje();
  }

  cerrarFormulario() {
    this.formularioActivo = null;
  }

  enviarWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(this.mensaje)}`;
    window.open(url, '_blank');
    this.cerrarFormulario();
  }

  enviarGmail() {
    const mailto = `mailto:${this.correo}?subject=${encodeURIComponent(this.asunto)}&body=${encodeURIComponent(this.mensaje)}`;
    window.open(mailto, '_blank');
    this.cerrarFormulario();
  }

  enviarSms() {
    const smsUrl = `sms:${this.telefono}?body=${encodeURIComponent(this.mensaje)}`;
    window.open(smsUrl, '_blank');
    this.cerrarFormulario();
  }

  getMensaje() {
    return `
    Cliente: ${this.documento.cliente}
    Número de Documento: ${this.documento.numeroDocumento}
    Fecha de Emisión: ${this.documento.fechaEmision}
    Monto Total: ${this.documento.montoTotal}`;
  }
}
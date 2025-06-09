import { Component, Output, EventEmitter, Input } from '@angular/core';

// Interfaz para los datos del documento
export interface DocumentoParaCompartir {
  nombre: string;
  url: string;
  resumen?: string;
}

@Component({
  selector: 'app-enviar-ges',
  templateUrl: './enviar-ges.component.html',
  styleUrl: './enviar-ges.component.css'
})
export class EnviarGesComponent {
  @Input() documentoAEnviar: DocumentoParaCompartir | null = null;
  @Output() cerrar = new EventEmitter<void>();

  isVisible = false;
  
  // Propiedades para el formulario
  destinatario: string = '';
  metodoSeleccionado: 'email' | 'whatsapp' = 'email'; // Email por defecto

  abrirModal() {
    this.isVisible = true;
    // Reseteamos el formulario cada vez que se abre el modal
    this.destinatario = '';
    this.metodoSeleccionado = 'email';
  }

  cerrarModal() {
    this.isVisible = false;
    this.cerrar.emit();
  }
  
  // Este método se llama cuando el formulario hace 'submit'
  enviarDocumento() {
    if (!this.documentoAEnviar || !this.destinatario) {
      console.error('Faltan datos para realizar el envío.');
      return;
    }

    if (this.metodoSeleccionado === 'email') {
      this.enviarPorEmail();
    } else {
      this.enviarPorWhatsApp();
    }
  }

  private enviarPorEmail() {
    if (!this.documentoAEnviar || !this.destinatario) {
      console.error('Faltan datos para enviar por Gmail.');
      return;
    }

    // 1. Construir el asunto y el cuerpo del correo (esto no cambia)
    const subject = `Documento: ${this.documentoAEnviar.nombre}`;
    const body = `Hola,

Te comparto el siguiente documento:
${this.documentoAEnviar.nombre}

Puedes verlo o descargarlo en el siguiente enlace:
${this.documentoAEnviar.url}

Saludos.
`;

    // 2. Construir la URL específica para Gmail
    // Esta es la parte que cambia.
    const baseUrl = 'https://mail.google.com/mail/?view=cm&fs=1';
    const toParam = `&to=${encodeURIComponent(this.destinatario)}`;
    const subjectParam = `&su=${encodeURIComponent(subject)}`;
    const bodyParam = `&body=${encodeURIComponent(body)}`;
    
    const gmailLink = `${baseUrl}${toParam}${subjectParam}${bodyParam}`;

    // 3. Abrir la URL de Gmail en una nueva pestaña
    window.open(gmailLink, '_blank');
    this.cerrarModal();
  }

  private enviarPorWhatsApp() {
    // Limpiamos el número de teléfono para asegurar que solo contenga dígitos
    const numeroLimpio = this.destinatario.replace(/\D/g, '');

    const message = `Hola, te comparto el documento "${this.documentoAEnviar!.nombre}". Puedes verlo aquí: ${this.documentoAEnviar!.url}`;
    
    // La diferencia clave: incluimos el número de teléfono en el enlace.
    const whatsappLink = `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${encodeURIComponent(message)}`;
    
    window.open(whatsappLink, '_blank');
    this.cerrarModal();
  }
}
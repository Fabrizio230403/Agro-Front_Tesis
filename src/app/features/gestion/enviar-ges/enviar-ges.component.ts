 import { Component , Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-enviar-ges',
  templateUrl: './enviar-ges.component.html',
  styleUrl: './enviar-ges.component.css'
})
export class EnviarGesComponent {
  isVisible = false; // Controla la visibilidad del modal
  
  // Emite un evento cuando el modal se cierra
  @Output() cerrar = new EventEmitter<void>();

  abrirModal() {
    this.isVisible = true;
  }

  cerrarModal() {
    this.isVisible = false;
    this.cerrar.emit(); // Emite el evento cuando se cierra el modal
  }

  enviarPorEmail() {
    // Redirige a Gmail
    window.open('https://mail.google.com', '_blank');
    this.cerrarModal(); // Cierra el modal después de hacer la acción
  }

  enviarPorWhatsApp() {
    // Redirige a WhatsApp
    window.open('https://wa.me/', '_blank');
    this.cerrarModal(); // Cierra el modal después de hacer la acción
  }

}
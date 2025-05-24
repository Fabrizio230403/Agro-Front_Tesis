 import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-eliminar-doc',
  templateUrl: './eliminar-doc.component.html',
  styleUrls: ['./eliminar-doc.component.css']
})
export class EliminarDocComponent {
  // Documento seleccionado para eliminar
  @Input() documentoSeleccionado: any;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() eliminarDocumentoEvent = new EventEmitter<any>();

  // Método para eliminar el documento
  eliminarDocumento() {
    this.eliminarDocumentoEvent.emit(this.documentoSeleccionado);
    this.cerrarModal.emit(); // Cerrar el modal después de eliminar
  }
}
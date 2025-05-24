 import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-editar-doc',
  templateUrl: './editar-doc.component.html',
  styleUrls: ['./editar-doc.component.css'],
})
export class EditarDocComponent {
  @Input() documento: any; // Documento seleccionado para editar
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() editarDocumento = new EventEmitter<any>();

  documentoEditado: any = {};

  ngOnInit(): void {
    // Crear una copia del documento para evitar mutaciones directas
    this.documentoEditado = { ...this.documento };
  }

  guardarCambios() {
    // Emitir el documento actualizado
    this.editarDocumento.emit(this.documentoEditado);
  }

  cerrar() {
    // Emitir evento para cerrar el modal sin guardar
    this.cerrarModal.emit()
;
  }
}
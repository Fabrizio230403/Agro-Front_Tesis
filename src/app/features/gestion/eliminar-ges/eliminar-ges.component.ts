 import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-eliminar-ges',
  templateUrl: './eliminar-ges.component.html',
  styleUrl: './eliminar-ges.component.css'
})
export class EliminarGesComponent {
   @Input() documentosEliminados: any[] = [];
  @Input() visible: boolean = false;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() restaurarDocumento = new EventEmitter<any>();

  cerrar() {
    this.cerrarModal.emit();
  }

  recuperar(doc: any) {
    this.restaurarDocumento.emit(doc);
  }

}
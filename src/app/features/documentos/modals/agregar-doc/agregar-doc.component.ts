 import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-agregar-doc',
  templateUrl: './agregar-doc.component.html',
  styleUrls: ['./agregar-doc.component.css'],
})
export class AgregarDocComponent {
  modalAgregarDocVisible: boolean = true;
  @Output() agregarDocumento = new EventEmitter<any>();
  @Output() cerrarModal = new EventEmitter<void>();

  nuevoDocumento = {
    fechaEmision: '',
    numeroDocumento: '',
    cliente: '',
    montoTotal: null,
    estadoPago: 'Activo',
  };

  onSubmit() {
    if (this.validarDocumento(this.nuevoDocumento)) {
      this.agregarDocumento.emit(this.nuevoDocumento);
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }

  cerrarmodal() {
    this.cerrarModal.emit();
  }

  private validarDocumento(documento: any): boolean {
    return (
      documento.fechaEmision &&
      documento.numeroDocumento &&
      documento.cliente &&
      documento.montoTotal &&
      documento.estadoPago
    );
  }
}
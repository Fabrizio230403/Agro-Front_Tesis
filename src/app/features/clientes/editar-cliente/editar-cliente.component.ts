import { Component, ViewChild, TemplateRef, Inject, Output, EventEmitter, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../../../models/client.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css'],
  encapsulation: ViewEncapsulation.None // Esto permitirá que los estilos sean globales

})
export class EditarClienteComponent implements OnChanges {
  @Input() client: Cliente | null = null;
  @Output() clientUpdated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Propiedades del formulario
  id: number | null = null;
  name: string = '';
  typeCustomer: string = '';
  documentType: string = '';
  documentNumber: string = '';
  address: string = '';
  phone: string = '';
  email: string = '';

  // Constructor limpio, sin dependencias de MatDialog
  constructor(private http: HttpClient) {}

  ngOnChanges(): void {
    if (this.client) {
      this.id = this.client.id;
      this.name = this.client.name ?? '';
      this.typeCustomer = this.client.typeCustomer ?? '';
      this.documentType = this.client.documentType ?? '';
      this.documentNumber = this.client.documentNumber ?? '';
      this.address = this.client.address ?? '';
      this.phone = this.client.phone ?? '';
      this.email = this.client.email ?? '';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }


  onEdit(): void {
    if (!this.id) {
        console.error("No se puede actualizar un cliente sin ID.");
        return;
    }

    if (
      this.name.trim() && this.typeCustomer.trim() && this.documentType.trim() &&
      this.documentNumber.trim() && this.address.trim() && this.phone.trim() && this.email.trim()
    ) {
      const updatedCliente = {
        id: this.id,
        name: this.name,
        typeCustomer: this.typeCustomer,
        documentType: this.documentType,
        documentNumber: this.documentNumber,
        address: this.address,
        phone: this.phone,
        email: this.email,
      };

      Swal.fire({
        title: 'Actualizando cliente...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });
      
      this.http.put(`http://localhost:8091/api/customers/${updatedCliente.id}`, updatedCliente, { responseType: 'text', withCredentials: true }).subscribe({
        next: (response: string) => {
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El cliente ha sido actualizado correctamente.',
            icon: 'success',
          }).then(() => {
            // Emite el evento para que el padre sepa que debe recargar y cerrar
            this.clientUpdated.emit();
          });
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el cliente.',
            icon: 'error',
          });
          console.error("Error al actualizar cliente:", error);
        }
    });
    } else {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
      });
    }
  }

  // Validación de campo numero documento

  onKeyPress(event: KeyboardEvent): void {
    if (this.documentType === 'RUC' || this.documentType === 'DNI' || this.documentType === 'Carné de Extranjería') {
      const pattern = /^[0-9]*$/;
      if (!pattern.test(event.key)) {
        event.preventDefault();
      }
    }
    else if (this.documentType === 'Pasaporte') {
      const pattern = /^[A-Za-z0-9]*$/;
      if (!pattern.test(event.key)) {
        event.preventDefault();
      }
    }
  }

  getDocumentoPattern(): string {
    switch (this.documentType) {
      case 'RUC':
        return '^[0-9]{11}$';
      case 'DNI':
        return '^[0-9]{8}$';
      case 'Carné de Extranjería':
        return '^[0-9]{9}$';
      case 'Pasaporte':
        return '^[A-Za-z0-9]+$';
      default:
        return '';
    }
  }

  getDocumentoMaxLength(): number {
    switch (this.documentType) {
      case 'RUC':
        return 11;
      case 'DNI':
        return 8;
      case 'Carné de Extranjería':
      case 'Pasaporte':
        return 9;
      default:
        return 0;
    }
  }


  limpiarNumeroDocumento(): void {
    this.documentNumber = '';
  }

  onPaste(event: ClipboardEvent): void {
    const textoPegado = event.clipboardData?.getData('text');
    const isValid = this.esValidoPegado(textoPegado);

    if (!isValid) {
      event.preventDefault();
    }
  }

  private esValidoPegado(textoPegado: string | undefined): boolean {
    if (!textoPegado) {
      return false;
    }

    switch (this.documentType) {
      case 'RUC':
        return /^[0-9]{11}$/.test(textoPegado);
      case 'DNI':
        return /^[0-9]{8}$/.test(textoPegado);
      case 'Carné de Extranjería':
        return /^[0-9]{9}$/.test(textoPegado);
      case 'Pasaporte':
        return /^[A-Za-z0-9]+$/.test(textoPegado);
      default:
        return false;
    }
  }

  // Validación del campo teléfono

  onTelefonoKeyPress(event: KeyboardEvent): void {
    const pattern = /^[0-9]$/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  onTelefonoPaste(event: ClipboardEvent): void {
    const textoPegado = event.clipboardData?.getData('text');
    if (!this.esValidoTelefono(textoPegado)) {
      event.preventDefault();
    }
  }

  private esValidoTelefono(textoPegado: string | undefined): boolean {
    return textoPegado ? /^\d{9}$/.test(textoPegado) : false;
  }
}
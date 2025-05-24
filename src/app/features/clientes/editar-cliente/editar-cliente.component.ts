import { Component, ViewChild, TemplateRef, Inject, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css'],
  encapsulation: ViewEncapsulation.None // Esto permitirá que los estilos sean globales

})
export class EditarClienteComponent {
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  @ViewChild('errorModal') errorModal!: TemplateRef<any>;

  @Output() clienteEdited = new EventEmitter<void>();

  name: string;
  typeCustomer: string;
  documentType: string;
  documentNumber: string;
  address: string;
  phone: string;
  email: string;
  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private parentDialogRef: MatDialogRef<any>,
    private http: HttpClient
  ) {
    this.name = data.name;
    this.typeCustomer = data.typeCustomer;
    this.documentType = data.documentType;
    this.documentNumber = data.documentNumber;
    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
  }

  onCancel(): void {
    this.parentDialogRef.close();
  }


  onEdit(): void {
    if (
      this.name &&
      this.typeCustomer &&
      this.documentType &&
      this.documentNumber &&
      this.address &&
      this.phone &&
      this.email
    ) {
      const updatedCliente = {
        id: this.data.id,
        name: this.name,
        typeCustomer: this.typeCustomer,
        documentType: this.documentType,
        documentNumber: this.documentNumber,
        address: this.address,
        phone: this.phone,
        email: this.email,
      };

      Swal.fire({
        title: 'Editando cliente...',
        html: 'Por favor, espera mientras se guarda la información.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.http.put(`http://localhost:8091/api/customers/${updatedCliente.id}`, updatedCliente, { responseType: 'text', withCredentials: true }).subscribe(
        (response: string) => {
          Swal.fire({
            title: 'Cliente editado',
            text: response,
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            this.clienteEdited.emit();
            this.parentDialogRef.close(updatedCliente);
          });
        },
        (error) => {
          Swal.fire({
            title: 'Error',
            text: `No se pudo editar el cliente. Detalles: ${error.message || 'Error desconocido'}`,
            icon: 'error',
            confirmButtonText: 'Reintentar',
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
    }
  }

  closeSuccessModal(): void {
    this.dialogRef.close();
  }

  closeErrorModal(): void {
    this.dialogRef.close();
  }

  retryEdit(): void {
    this.dialogRef.close();
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
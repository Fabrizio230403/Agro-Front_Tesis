import { Component, ViewChild, TemplateRef, Inject, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/client.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrls: ['./agregar-usuario.component.css'],
    encapsulation: ViewEncapsulation.None // Esto permitirá que los estilos sean globales

})
export class AgregarUsuarioComponent {
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  @ViewChild('errorModal') errorModal!: TemplateRef<any>;

  @Output() clienteAdded = new EventEmitter<void>();

  name: string = '';
  typeCustomer: string = '';
  documentType: string = '';
  documentNumber: string = '';
  address: string = '';
  phone: string = '';
  email: string = '';
  dialogRef!: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    @Inject(MatDialogRef) private parentDialogRef: MatDialogRef<any>,
    private clienteService: ClienteService
  ) {}

  onCancel(): void {
    this.parentDialogRef.close();
  }

  async onAdd(): Promise<void> {
    if (!this.isFormValid()) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const cliente: Cliente = this.createCliente();

    Swal.fire({
      title: 'Agregando cliente...',
      html: 'Por favor, espera mientras se registra el cliente.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await this.clienteService.guardarCliente(cliente).toPromise();
      
      Swal.fire({
        title: 'Cliente registrado',
        text: 'El cliente se ha registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.clienteAdded.emit();
        this.parentDialogRef.close();
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo registrar el cliente. Intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      console.error('Error al agregar cliente:', error);
    }
  }

  private isFormValid(): boolean {
    return (
      this.name !== '' &&
      this.typeCustomer !== '' &&
      this.documentType !== '' &&
      this.documentNumber !== '' &&
      this.address !== '' &&
      this.phone !== '' &&
      this.email !== ''
    );
  }

  // Método para crear objeto cliente
  private createCliente(): Cliente {
    return {
      id: 0,
      name: this.name,
      typeCustomer: this.typeCustomer,
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      address: this.address,
      phone: this.phone,
      email: this.email
    };
  }

  // Método modal de éxito
  private showSuccessModal(response: any): void {
    console.log(response); 
    this.dialogRef = this.dialog.open(this.successModal, {
      width: '400px',
      height: 'auto'
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.clienteAdded.emit();
      this.parentDialogRef.close();
    });
  }

  // Método modal de error
  private showErrorModal(): void {
    this.dialogRef = this.dialog.open(this.errorModal, {
      width: '400px',
      height: 'auto'
    });
  }

  closeSuccessModal(): void {
    this.dialogRef.close();
  }

  closeErrorModal(): void {
    this.dialogRef.close();
  }

  retryAdd(): void {
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
  
  // Método para validar el texto pegado en el campo de teléfono
  private esValidoTelefono(textoPegado: string | undefined): boolean {
    return textoPegado ? /^\d{9}$/.test(textoPegado) : false;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cliente } from '../../../models/client.model'; // o donde tengas la interfaz
import { ClienteService } from '../../../services/cliente.service'; // Servicio para guardar clientes
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-cliente',
  templateUrl: './agregar-cliente.component.html',
  styleUrls: ['./agregar-cliente.component.css']
})
export class AgregarClienteComponent {
  @Input() showModal: boolean = false;
  showConfirmationModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() clienteAgregado = new EventEmitter<Cliente>();

  // Campos que coinciden con la interfaz Cliente (sin id, que usualmente es autogenerado)
  name: string = '';
  typeCustomer: string = '';
  documentType: string = '';
  documentNumber: string = '';
  address: string = '';
  phone: string = '';
  email: string = '';

  constructor(private clienteService: ClienteService) { }



  // Método para agregar cliente
  async agregarCliente() {
    if (!this.isFormValid()) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const nuevoCliente: Cliente = {
      id: 0,
      name: this.name,
      typeCustomer: this.typeCustomer,
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      address: this.address,
      phone: this.phone,
      email: this.email
    };

    Swal.fire({
      title: 'Agregando cliente...',
      html: 'Por favor, espera mientras se registra el cliente.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await this.clienteService.guardarCliente(nuevoCliente).toPromise();

      Swal.fire({
        title: 'Cliente registrado',
        text: 'El cliente se ha registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.clienteAgregado.emit(nuevoCliente); // Emitimos el cliente completo aquí
        this.cancelar();
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
      this.name.trim() !== '' &&
      this.typeCustomer.trim() !== '' &&
      this.documentType.trim() !== '' &&
      this.documentNumber.trim() !== '' &&
      this.address.trim() !== '' &&
      this.phone.trim() !== '' &&
      this.email.trim() !== ''
    );
  }

  // Método para limpiar los campos del formulario
  private limpiarCampos() {
    this.name = '';
    this.typeCustomer = '';
    this.documentType = '';
    this.documentNumber = '';
    this.address = '';
    this.phone = '';
    this.email = '';
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

  // Método para cerrar el modal de agregar cliente
  cancelar() {
    this.showModal = false;
    this.closeModal.emit();
    this.limpiarCampos();
  }

  // Método para cerrar el modal de confirmación
  closeConfirmation() {
    this.showConfirmationModal = false;
    this.cancelar();
  }
}

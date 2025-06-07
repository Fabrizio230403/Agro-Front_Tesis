import { Component,  ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClienteService } from '../../services/cliente.service';
import { ConfirmDeleteModalComponent } from '../../features/clientes/confirm-delete-modal/confirm-delete-modal.component';
import { AgregarUsuarioComponent } from '../../features/clientes/agregar-usuario/agregar-usuario.component';
import { EditarClienteComponent } from '../../features/clientes/editar-cliente/editar-cliente.component';
import { ClienteDetalleComponent } from '../../features/clientes/cliente-detalle/cliente-detalle.component';
import { Cliente } from '../../models/client.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
    encapsulation: ViewEncapsulation.None // Esto permitirá que los estilos sean globales

})
export class ClientesComponent {
  isSidebarVisible = true;
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  filtroNombre: string = '';
  filtroDocumento: string = '';
  filtroTipo: string = '';
  filtroCampo: string = '';
  filtroTermino: string = '';

  currentPage: number = 1;
  pageSize: number = 10; // Número de clientes por página


  constructor(
    private dialog: MatDialog,
    private clienteService: ClienteService
  ) { }

  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes(): void {
    this.clienteService.listarClientes().subscribe(
      (clientes: Cliente[]) => {
        this.clientes = clientes;
        this.clientesFiltrados = [...clientes];
      },
      (error) => {
        console.error('Error al obtener clientes:', error);
      }
    );
  }

  filtrarClientes(): void {
    if (!this.filtroCampo || this.filtroTermino.trim() === '') {
      this.clientesFiltrados = [...this.clientes];

      return;
    }

    if (this.filtroCampo === 'documentNumber' && !/^\d+$/.test(this.filtroTermino.trim())) {
      return;
    }

    const termino = this.filtroTermino.toLowerCase().trim();
    this.currentPage = 1;

    this.clientesFiltrados = this.clientes.filter((cliente) => {
      switch (this.filtroCampo) {
        case 'name':
          return cliente.name?.toLowerCase().includes(termino);
        case 'documentNumber':
          return cliente.documentNumber?.toLowerCase().includes(termino);
        case 'typeCustomer':
          return cliente.typeCustomer?.toLowerCase().includes(termino);
        default:
          return false;
      }
    });
  }

  validateInput(event: any): void {
    const inputValue = event.target.value;
    if (this.filtroCampo === 'documentNumber') {
      // Evita ingresar letras si el campo es 'documentNumber'
      if (!/^\d+$/.test(inputValue)) {
        event.target.value = inputValue.replace(/[^0-9]/g, '');  // Solo números
      }
    }
  }

  openConfirmDeleteModal(clienteId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás recuperar este cliente después de eliminarlo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCliente(clienteId);
      } else {
        Swal.fire('Cancelado', 'El cliente no ha sido eliminado', 'info');
      }
    });
  }

  deleteCliente(clienteId: number): void {
    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor, espera mientras se elimina el cliente.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.clienteService.eliminarCliente(clienteId).subscribe(
      (response) => {
        this.clientes = this.clientes.filter(cliente => cliente.id !== clienteId);
        this.clientesFiltrados = this.clientesFiltrados.filter(cliente => cliente.id !== clienteId);
        Swal.fire('Eliminado', 'El cliente ha sido eliminado correctamente', 'success');
      },
      (error) => {
        Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
        console.error('Error al eliminar cliente:', error);
      }
    );
  }

  onClienteAdded(): void {
    this.listarClientes();
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  openAgregarUsuarioModal(): void {
    const dialogRef = this.dialog.open(AgregarUsuarioComponent, {
      width: '600px',
    });
    
    dialogRef.componentInstance.clienteAdded.subscribe(() => {
      this.onClienteAdded();
    });
  }

  openEditarClienteModal(cliente: Cliente): void {
    const dialogRef = this.dialog.open(EditarClienteComponent, {
      width: '600px',
      data: cliente
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.clienteService.actualizarCliente(result.id, result).subscribe(
            (response) => {
              this.listarClientes();
            },
            (error) => {
              console.error('Error al actualizar cliente:', error);
            }
          );
        } else {
          console.error('El cliente no tiene un ID válido');
        }
      }
    });
  }

  openDetalleClienteModal(cliente: Cliente): void {
    this.dialog.open(ClienteDetalleComponent, {
      width: '400px',
      data: cliente
    });
  }

  getClientesPorPagina(): Cliente[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.clientesFiltrados.slice(startIndex, endIndex);
  }

  cambiarPagina(direccion: 'anterior' | 'siguiente'): void {
    if (direccion === 'anterior' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direccion === 'siguiente' && this.currentPage < this.getTotalPaginas()) {
      this.currentPage++;
    }
  }

  getTotalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.pageSize);
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPaginas();
    const pageRangeDisplayed = 2; // Cuántos números mostrar a cada lado de la página actual
    const pageNumbers: (number | string)[] = [];

    // Si no hay páginas, devuelve un array vacío
    if (totalPages === 0) return [];
    
    // Si no hay suficientes páginas para necesitar "...", muestra todos los números
    const totalPageNumbersToShow = (pageRangeDisplayed * 2) + 5; // (rango*2) + actual + primera + ultima + 2 "..."
    if (totalPages <= totalPageNumbersToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Lógica para añadir "..."
    pageNumbers.push(1); // Siempre muestra la primera página

    let startPage = Math.max(2, this.currentPage - pageRangeDisplayed);
    let endPage = Math.min(totalPages - 1, this.currentPage + pageRangeDisplayed);

    if (this.currentPage - pageRangeDisplayed > 2) {
      pageNumbers.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (this.currentPage + pageRangeDisplayed < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    pageNumbers.push(totalPages); // Siempre muestra la última página

    return pageNumbers;
  }

  onPage(event: any) {
    this.currentPage = event.page;  // Actualizar la página actual con la nueva página seleccionada
    this.pageSize = event.pageSize; // Actualizar el tamaño de página si se cambia
    // Aquí podrías realizar más acciones, como filtrar o recargar los datos de la página
    console.log('Página cambiada:', this.currentPage);
    console.log('Tamaño de página:', this.pageSize);

    // Lógica adicional para manejar los datos de la tabla según la página y tamaño
    // (por ejemplo, cargar los clientes de esa página)
  }
}

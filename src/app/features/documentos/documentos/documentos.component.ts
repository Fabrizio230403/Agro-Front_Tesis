 import { Component } from '@angular/core';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css'],
})
export class DocumentosComponent {
  // Variables de estado y visibilidad de modales
  isSidebarVisible: boolean = true;
  modalAgregarDocVisible: boolean = false;
  modalEditarDocVisible: boolean = false;
  modalEliminarDocVisible: boolean = false;
  modalEnviarDocVisible: boolean = false;
  documentoSeleccionado: any;

  // Datos iniciales de documentos
  documentos = [
    { fechaEmision: '2024-11-01', numeroDocumento: '001-2024', cliente: 'Cliente A', montoTotal: 500.25, estadoPago: 'Activo' },
    { fechaEmision: '2024-11-10', numeroDocumento: '002-2024', cliente: 'Cliente B', montoTotal: 1000.75, estadoPago: 'Archivado' },
    { fechaEmision: '2024-11-20', numeroDocumento: '003-2024', cliente: 'Cliente C', montoTotal: 750.0, estadoPago: 'Activo' },
  ];
  filteredDocuments = [...this.documentos];

  // Filtros de búsqueda
  fechaInicial: string = '';
  fechaFinal: string = '';
  searchQuery: string = '';

  constructor() {}

  ngOnInit(): void {}

  // Métodos para manejar la barra lateral
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  // Métodos de filtrado
  filterDocuments() {
    const fechaInicio = this.fechaInicial ? new Date(this.fechaInicial) : null;
    const fechaFin = this.fechaFinal ? new Date(this.fechaFinal) : null;
    const query = this.searchQuery.trim().toLowerCase();

    this.filteredDocuments = this.documentos.filter((doc) => {
      const fechaDocumento = new Date(doc.fechaEmision);
      const cumpleFecha = (!fechaInicio || fechaDocumento >= fechaInicio) && (!fechaFin || fechaDocumento <= fechaFin);
      const cumpleBusqueda = !query || doc.cliente.toLowerCase().includes(query) || doc.numeroDocumento.toLowerCase().includes(query);
      return cumpleFecha && cumpleBusqueda;
    });
  }

  // Métodos para manejo de modales
  abrirModalAgregarDoc() {
    this.modalAgregarDocVisible = true;
  }

  cerrarModalAgregarDoc() {
    this.modalAgregarDocVisible = false;
  }

  abrirModalEditar(documento: any) {
    this.documentoSeleccionado = { ...documento };
    this.modalEditarDocVisible = true;
  }

  cerrarModalEditar() {
    this.modalEditarDocVisible = false;
  }

  abrirModalEliminar(documento: any) {
    this.documentoSeleccionado = documento;
    this.modalEliminarDocVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarDocVisible = false;
  }

  // Método para eliminar documento
  eliminarDocumento(documento: any) {
    console.log('Documento eliminado:', documento);
    // Aquí agregas la lógica de eliminación, como llamar a un servicio para eliminar en la base de datos
    this.cerrarModalEliminar();  // Cerrar el modal después de eliminar
  }

  // Métodos CRUD
  agregarDocumento(nuevoDocumento: any) {
    this.documentos.push(nuevoDocumento);
    this.filteredDocuments = [...this.documentos];
    this.cerrarModalAgregarDoc();
  }

  actualizarDocumento(documentoActualizado: any) {
    const index = this.documentos.findIndex((doc) => doc.numeroDocumento === documentoActualizado.numeroDocumento);
    if (index !== -1) {
      this.documentos[index] = documentoActualizado;
      this.filteredDocuments = [...this.documentos];
    }
    this.cerrarModalEditar();
  }

  // Función para abrir el modal de envío
  abrirModalEnviar(documento: any) {
    this.documentoSeleccionado = documento;
    this.modalEnviarDocVisible = true;
  }

  // Función para cerrar el modal de envío
  cerrarModalEnviar() {
    this.modalEnviarDocVisible = false;
  }

  // Función para enviar el documento
  enviarDocumento(documento: any) {
    console.log('Enviando documento:', documento);
    // Agregar lógica de envío, como llamar a un servicio API
  }
}
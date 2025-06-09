 import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DocumentService, Documento } from '../../services/document.service';
import { EnviarGesComponent, DocumentoParaCompartir } from '../gestion/enviar-ges/enviar-ges.component';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css'],
})
export class GestionComponent {
  selectedDate: string = '';
  formattedDate: string = '';
  isSidebarVisible: boolean = true;
  paginaActual: number = 1;
  documentosPorPagina: number = 10;
  documentosPaginados: Documento[] = [];
  documentosFiltrados: Documento[] = [];
  documents: Documento[] = [];
  searchTerm: string = '';
  documentoSeleccionado: Documento | null = null;
  mostrarModal: boolean = false;
  documentosEliminados: any[] = [];
  mostrarModalRecuperar: boolean = false;
  pdfUrl: string | null = null;
  mostrarVista: boolean = false;

  @Output() sidebarToggle = new EventEmitter<void>();
  @ViewChild(EnviarGesComponent, { static: false })
  modalEnviarGes!: EnviarGesComponent;
  @ViewChild('modalVerGes') modalVerGes: any;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.cargarDocumentos();
    this.cargarDocumentosEliminados();
  }
  cargarDocumentos(): void {
    this.documentService.getDocumentos().subscribe({
      next: (data) => {
        const documentosSinEliminados = data.filter(
          (doc) =>
            !this.documentosEliminados.some(
              (eliminado) => eliminado.numeroDocumento === doc.numeroDocumento
            )
        );
        this.documents = documentosSinEliminados;
        this.documentosFiltrados = documentosSinEliminados; // Inicialmente muestra todos
        this.paginaActual = 1;
        this.actualizarDocumentosPaginados();
      },
      error: (err) => {
        console.error('Error al cargar documentos:', err);
      },
    });
  }
  actualizarDocumentosPaginados(): void {
    const inicio = (this.paginaActual - 1) * this.documentosPorPagina;
    const fin = inicio + this.documentosPorPagina;
    this.documentosPaginados = this.documentosFiltrados.slice(inicio, fin);
  }
  filtrarPorBusqueda(): Documento[] {
    if (!this.searchTerm) {
      return this.documents; // Si no hay término de búsqueda, devuelve todos los documentos
    }
    return this.documents.filter(
      (doc) =>
        doc.cliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.numeroDocumento
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
    );
  }
  buscarDocumentos(): void {
    const termino = this.searchTerm.trim().toLowerCase();
    if (!termino) {
      this.documentosFiltrados = this.documents;
    } else {
      this.documentosFiltrados = this.documents.filter(
        (doc) => doc.numeroDocumento?.toLowerCase() === termino
      );
    }
    this.paginaActual = 1;
    this.actualizarDocumentosPaginados();
  }
  abrirModalDeEnvio(documento: Documento) {
    if (!documento || !documento.urlDocumento) {
        Swal.fire({
            icon: 'error',
            title: 'No se puede compartir',
            text: 'El documento seleccionado no tiene una URL válida para ser compartido.',
        });
        return;
    }

    // 1. Mapea los datos de tu 'documento' al formato que el modal espera.
    const documentoAEnviar: DocumentoParaCompartir = {
        nombre: `${documento.tipoDocumento} ${documento.numeroDocumento}`,
        url: documento.urlDocumento, // Usamos la URL que ya tiene el documento
        resumen: `Cliente: ${documento.cliente}`
    };

    // 2. Asigna el objeto al @Input del componente modal.
    this.modalEnviarGes.documentoAEnviar = documentoAEnviar;

    // 3. Llama al método público del modal para que se muestre.
    this.modalEnviarGes.abrirModal();
  }
  /*updateFormattedDate(): void {
      if (this.selectedDate) {
        const date = new Date(this.selectedDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        this.formattedDate = `${day}/${month}/${year}`; // Formato 'dd/mm/yyyy'
      } else {
        this.formattedDate = '';
      }
    }*/
  clearDate(): void {
    this.selectedDate = '';
    this.formattedDate = '';
  }
  confirmDate(): void {
    console.log('Fecha confirmada:', this.formattedDate);
  }

  filtrarPorFecha(fecha: string): void {
    if (!fecha) {
      this.documentosFiltrados = this.documents; // Si no hay fecha, muestra todos los documentos
    } else {
      const fechaSeleccionada = new Date(fecha);
      this.documentosFiltrados = this.documents.filter((doc) => {
        const fechaDocumento = new Date(doc.fechaEmision); // Asegúrate de que `doc.fecha` sea una propiedad válida
        return (
          fechaDocumento.getDate() === fechaSeleccionada.getDate() &&
          fechaDocumento.getMonth() === fechaSeleccionada.getMonth() &&
          fechaDocumento.getFullYear() === fechaSeleccionada.getFullYear()
        );
      });
    }
    this.paginaActual = 1; // Reinicia a la primera página
    this.actualizarDocumentosPaginados();
  }

  agregarDocumento(): void {
    console.log('Agregar nuevo documento');
    // Implementar lógica para agregar documento
  }
  imprimirDocumento(doc: Documento): void {
    if (!doc.urlDocumento) {
      Swal.fire({
        title: 'Error',
        text: 'El documento no tiene una URL válida para imprimir',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      title: 'Preparando documento para impresión',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const googleViewerUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(
      doc.urlDocumento
    )}`;

    const printWindow = window.open(googleViewerUrl, '_blank');

    if (!printWindow) {
      Swal.fire({
        title: 'Bloqueo detectado',
        text: 'Por favor, habilita las ventanas emergentes para imprimir el documento',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.close();

    // No se puede forzar print(), solo esperar a que el usuario lo haga
  }

  eliminarDocumento(doc: Documento): void {
    Swal.fire({
      title: '¿Seguro que deseas eliminar este registro?',
      text: `Esta acción no se puede deshacer. El documento será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentosEliminados.push(doc);
        localStorage.setItem(
          'documentosEliminados',
          JSON.stringify(this.documentosEliminados)
        );
        this.documentosPaginados = this.documentosPaginados.filter(
          (d) => d !== doc
        );

        Swal.fire(
          '¡Eliminado!',
          'El documento ha sido enviado a la papelera temporal.',
          'success'
        );
      }
    });
  }
  cargarDocumentosEliminados() {
    const data = localStorage.getItem('documentosEliminados');
    if (data) {
      this.documentosEliminados = JSON.parse(data);
    }
    const documentosSinEliminados = this.documents.filter(
      (doc) =>
        !this.documentosEliminados.some(
          (eliminado) => eliminado.id === doc.numeroDocumento
        )
    );
    this.documentosFiltrados = documentosSinEliminados;
    this.actualizarDocumentosPaginados();
  }
  restaurarDocumento(doc: any) {
    this.documents.push(doc);
    this.documentosEliminados = this.documentosEliminados.filter(
      (d) => d !== doc
    );
    localStorage.setItem(
      'documentosEliminados',
      JSON.stringify(this.documentosEliminados)
    );
    this.actualizarDocumentosPaginados();
  }

  enviarDocumento(documento: Documento): void {
    console.log('Enviando documento:', documento);
    // Implementar lógica de envío
  }
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarDocumentosPaginados();
  }
  cambiarPaginaSiguiente(): void {
    const totalPaginas = this.totalPaginas();
    if (this.paginaActual < totalPaginas) {
      this.paginaActual++;
      this.actualizarDocumentosPaginados();
      console.log('Cambiando a la siguiente página:', this.paginaActual);
    }
  }
  cambiarPaginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarDocumentosPaginados();
      console.log('Cambiando a la página anterior:', this.paginaActual);
    }
  }
  pageNumbers(): number[] {
    const totalPaginas = this.totalPaginas();
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }
  abrirDocumento(documento: Documento): void {
    if (!documento.urlDocumento) {
      console.error('El documento no tiene una URL válida');
      return;
    }

    const url = `https://docs.google.com/gview?url=${documento.urlDocumento}&embedded=true`;
    this.modalVerGes.abrirModal(url);
  }

  cerrarDocumento() {
    this.mostrarVista = false;
  }
  abrirModal() {
    this.modalEnviarGes.abrirModal(); // Abre el modal desde el componente
  }

  cerrarModal() {
    this.modalEnviarGes.cerrarModal(); // Cierra el modal
  }

  // Calcular el total de páginas
  totalPaginas(): number {
    return Math.ceil(this.documents.length / this.documentosPorPagina);
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarToggle.emit();
  }
  abrirModalRecuperar(): void {
    this.mostrarModalRecuperar = true;
  }
  cerrarModalRecuperar(): void {
    this.mostrarModalRecuperar = false;
  }
  recuperarDocumento(doc: any): void {
    this.documentosEliminados = this.documentosEliminados.filter(
      (d) => d.numeroDocumento !== doc.numeroDocumento
    );
    localStorage.setItem(
      'documentosEliminados',
      JSON.stringify(this.documentosEliminados)
    );
    this.documents.push(doc);
    this.documentosFiltrados = this.filtrarPorBusqueda();
    this.actualizarDocumentosPaginados();
  }
}
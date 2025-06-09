 import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CategoryProductsService } from '../../../services/category-products.service';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filtrar-modal',
  templateUrl: './filtrar-modal.component.html',
  styleUrls: ['./filtrar-modal.component.css']
})
export class FiltrarModalComponent implements OnInit {
  @Output() cerrarModal = new EventEmitter<void>(); // Evento para cerrar el modal
  @Output() aplicarModal = new EventEmitter<any>(); // Evento para aplicar el filtro

  isSidebarVisible: boolean = true;
  // Variables para gestión de categorías
  agregarCategoriaModalVisible: boolean = false;
  editarCategoriaModalVisible: boolean = false;
  categoriaSeleccionada: any = null;
  categorias: any[] = []; // Lista de categorías
  categoriasPaginadas: any[] = []; // Categorías para mostrar en la página actual
  categoriasFiltradas: any[] = [];
  currentPage: number = 1; // Página actual
  itemsPorPagina: number = 6; // Cantidad de elementos por página
  showDeleteModal: boolean = false;
  filtroCampo: string = '';
  filtroTermino: string = '';



  constructor(
    private categoryService: CategoryProductsService,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.activatedRoute.snapshot.routeConfig?.path === 'productos') {
          this.cargarCategorias();

        }
      }
    });
  }

  // Método para alternar la visibilidad de la barra lateral
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }


  cargarCategorias(): void {
    const url = 'http://localhost:8091/api/categories';
    this.http.get<any[]>(url, { withCredentials: true }).subscribe({
      next: (data) => {
        this.categorias = data; // Asigna los datos a la lista de categorías
        this.categoriasFiltradas = [...data];

        this.actualizarCategoriasPaginadas();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      },
    });
  }


  filtrarCategorias(): void {
    if (!this.filtroCampo || this.filtroTermino.trim() === '') {
      this.categoriasFiltradas = [...this.categorias];
    } else {
      const termino = this.filtroTermino.toLowerCase().trim();
      this.categoriasFiltradas = this.categorias.filter(categoria =>
        categoria[this.filtroCampo]?.toLowerCase().includes(termino)
      );
    }
    this.currentPage = 1;
    this.actualizarCategoriasPaginadas();
  }

  // Actualiza las categorías que se muestran en la página actual
  actualizarCategoriasPaginadas() {
    const startIndex = (this.currentPage - 1) * this.itemsPorPagina;
    const endIndex = startIndex + this.itemsPorPagina;
    this.categoriasPaginadas = this.categoriasFiltradas.slice(startIndex, endIndex);
  }

  // Cambiar página
  cambiarPagina(direccion: string) {
    if (direccion === 'anterior' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direccion === 'siguiente' && this.currentPage < this.getTotalPaginas()) {
      this.currentPage++;
    }
    this.actualizarCategoriasPaginadas();
  }

  getTotalPaginas(): number {
    return Math.ceil(this.categoriasFiltradas.length / this.itemsPorPagina);
  }
  // Métodos del modal de filtro
  cerrarFiltroModal(): void {
    this.cerrarModal.emit(); // Emitir evento para cerrar
  }
  cerrarDeleteModal(): void {
    this.showDeleteModal = false;  // Cerrar el modal
  }

  // Métodos para manejo de modales de categorías
  abrirAgregarCategoriaModal(): void {
    this.agregarCategoriaModalVisible = true;
  }

  cerrarAgregarCategoriaModal(): void {
    this.agregarCategoriaModalVisible = false;
    this.cargarCategorias();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.activatedRoute.snapshot.routeConfig?.path === 'productos') {
          this.cargarCategorias();

        }
      }
    });
  }

  abrirEditarCategoriaModal(categoria: any): void {
    this.categoriaSeleccionada = categoria;
    this.editarCategoriaModalVisible = true;
  }

  cerrarEditarCategoriaModal(): void {
    this.cargarCategorias();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.activatedRoute.snapshot.routeConfig?.path === 'productos') {
          this.cargarCategorias();

        }
      }
    });
    this.editarCategoriaModalVisible = false;
  }


  eliminarCategoria(categoriaSeleccionada: any): void {
    if (!categoriaSeleccionada || !categoriaSeleccionada.id) {
      console.error('La categoría seleccionada es inválida o no tiene un ID.');
      return;
    }

    const url = `http://localhost:8091/api/categories/delete/${categoriaSeleccionada.id}`;

    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor, espera mientras se elimina la categoría.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    // Configuración de respuesta como texto
    this.http.delete(url, { responseType: 'text', withCredentials: true }).subscribe({
      next: (response) => {
        // Verificamos si la respuesta es adecuada (puede ser un mensaje o un código de estado)
        Swal.fire({
          title: 'Categoría Eliminada',
          text: 'La categoría se ha eliminado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });

        this.cargarCategorias();
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            if (this.activatedRoute.snapshot.routeConfig?.path === 'productos') {
              this.cargarCategorias();

            }
          }
        });

        // Cerramos el modal de eliminación
        this.cerrarDeleteModal();
      },
      error: (err) => {
        // Mensaje de error en caso de falla
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la categoría. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Reintentar'
        });

        // Consola de errores para depuración
        console.error('Error al eliminar la categoría:', err);
        console.log('Detalles del error:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message,
        });
      }
    });
  }


}

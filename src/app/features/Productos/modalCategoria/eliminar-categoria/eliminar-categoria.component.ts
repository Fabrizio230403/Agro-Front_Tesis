import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-eliminar-categoria',
  templateUrl: './eliminar-categoria.component.html',
  styleUrls: ['./eliminar-categoria.component.css']
})
export class EliminarCategoriaComponent {
  showDeleteModal: boolean = false;  // Controlar si el modal está visible
  categoriaSeleccionada = { id: 1, name: 'Categoría de ejemplo' };  // Datos de la categoría a eliminar

  constructor(private http: HttpClient) { }

  mostrarDeleteModal(): void {
    this.showDeleteModal = true;  // Mostrar el modal de eliminación
  }

  cerrarDeleteModal(): void {
    this.showDeleteModal = false;  // Cerrar el modal
  }

  eliminarCategoria(): void {
    // URL para la eliminación de categoría basada en su ID
    const url = `https://agroinversiones-api-ffaxcadua6gwf0fs.canadacentral-01.azurewebsites.net/api/categories/${this.categoriaSeleccionada.id}`;
    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor, espera mientras se elimina la categoría.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.delete(url).subscribe({
      next: (response) => {
         Swal.fire({
                    title: 'categoría Eliminado',
                    text: 'El producto se ha eliminado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                  }).then(() => {
                    window.location.reload();
                  });
        this.cerrarDeleteModal();  
      },
      error: (err) => {
        Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la categoría.',
                    icon: 'error',
                    confirmButtonText: 'Reintentar'
                  });
        console.error('Error al eliminar la categoría:', err);

      }
    });
  }
}

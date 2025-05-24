import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

export interface Categoria {
  id: number;
  name: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-editar-categoria',
  templateUrl: './editar-categoria.component.html',
  styleUrls: ['./editar-categoria.component.css']
})
export class EditarCategoriaComponent {
  @Input() categoriaSeleccionada!: Categoria;
  @Output() cerrarModal: EventEmitter<void> = new EventEmitter();
  @Output() categoriaEditada: EventEmitter<Categoria> = new EventEmitter();

  selectedFile: any = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Verifica si la categoría tiene imagen y se muestra una imagen predeterminada si no tiene imagen
    if (this.categoriaSeleccionada.image && this.categoriaSeleccionada.image !== '') {
      this.imagePreview = this.categoriaSeleccionada.image;
    } else {
      this.imagePreview = 'ruta_por_defecto'; // Cambia esto por una imagen predeterminada si no hay imagen
    }
  }

  // Manejo de archivo de imagen seleccionado
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Verifica el tipo de archivo (si es una imagen válida)
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor, selecciona una imagen válida (JPEG o PNG)');
      }
    }
  }

  editarCategoria(): void {
    const url = `http://localhost:8091/api/categories/edit/${this.categoriaSeleccionada.id}`;

    const formData = new FormData();
    formData.append('CatProduct', new Blob([JSON.stringify({
      name: this.categoriaSeleccionada.name,
      description: this.categoriaSeleccionada.description,
      image: this.categoriaSeleccionada.image
    })], { type: 'application/json' }));

    Swal.fire({
      title: 'Editando categoría...',
      html: 'Por favor, espera mientras se completa el registro.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Enviar los datos con multipart/form-data
    this.http.put(url, formData, {withCredentials: true}).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Categoría editado',
          text: 'La categoría se ha editado con éxito.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        //this.categoriaEditada.emit(this.categoriaSeleccionada);
        this.cerrarModal.emit();
      },
      error: (error) => {
        console.error('Error al actualizar la categoría:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo editar la categoría.',
          icon: 'error',
          confirmButtonText: 'Reintentar'
        });
      }
    });
  }

  cerrarEditarCategoriaModal(): void {
    this.cerrarModal.emit();
  }
}

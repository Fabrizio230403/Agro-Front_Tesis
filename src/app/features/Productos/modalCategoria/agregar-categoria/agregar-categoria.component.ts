import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

export interface Categoria {
  id: number;
  name: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-agregar-categoria',
  templateUrl: './agregar-categoria.component.html',
  styleUrls: ['./agregar-categoria.component.css']
})
export class AgregarCategoriaComponent {
  @Output() cerrarModal: EventEmitter<void> = new EventEmitter();
  @Output() categoriaAgregada: EventEmitter<any> = new EventEmitter();

  nuevaCategoria: Categoria = {
    id: 0,
    name: '',
    description: '',
    image: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageError: string | null = null;

  constructor(private http: HttpClient) { }

  // Método para seleccionar archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.imageError = 'Solo se permiten imágenes JPEG o PNG';
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      } else {
        this.imageError = null;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para registrar la categoría
  agregarCategoria(): void {
    if (!this.nuevaCategoria.name || !this.nuevaCategoria.description) {
      Swal.fire({
        title: 'Campos obligatorios',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    const formData = new FormData();
    const categoryData = {
      name: this.nuevaCategoria.name,
      description: this.nuevaCategoria.description,
      image: ''
    };
  
    formData.append('CatProduct', new Blob([JSON.stringify(categoryData)], { type: 'application/json' }));
  
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
  
    const url = 'http://localhost:8091/api/categories/register';
  
    Swal.fire({
      title: 'Registrando categoría...',
      html: 'Por favor, espera mientras se completa el registro.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.http.post(url, formData, { observe: 'response', responseType: 'text', withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.status === 201) { 
          Swal.fire({
            title: 'Categoría registrada',
            text: response.body || 'La categoría se ha registrado con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
    
          this.categoriaAgregada.emit(response.body); 
          this.resetForm();
          this.cerrar();
        } else {
          Swal.fire({
            title: 'Error',
            text: `Código de estado inesperado: ${response.status}`,
            icon: 'error',
            confirmButtonText: 'Reintentar'
          });
        }
      },
      error: (err) => {
        console.error('Error en el registro:', err);
    
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar la categoría. Inténtalo nuevamente.',
          icon: 'error',
          confirmButtonText: 'Reintentar'
        });
      }
    });

  }
  
  // Método para resetear el formulario
  resetForm(): void {
    this.nuevaCategoria = {
      id: 0,
      name: '',
      description: '',
      image: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  // Método para cerrar el modal
  cerrar(): void {
    this.cerrarModal.emit();
  }
}

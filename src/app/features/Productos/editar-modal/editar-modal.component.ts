import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { CategoryProductsService } from '../../../services/category-products.service';
import { SuppliersService } from '../../../services/suppliers.service';

import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-editar-modal',
  templateUrl: './editar-modal.component.html',
  styleUrls: ['./editar-modal.component.css']
})
export class EditarModalComponent {
  @Input() productoSeleccionado: any;
  @Input() editarModalVisible: boolean = false;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() actualizarProducto = new EventEmitter<any>();

  categorias: any[] = [];
  suppliers: any[] = [];
  selectedFile: any = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private productService: ProductsService, private http: HttpClient,
    private categoryProductsService: CategoryProductsService,
    private suppliersService: SuppliersService
  ) { }

  cerrarEditarModal(): void {
    this.cerrarModal.emit();
    
  }
  ngOnInit() {
    this.cargarCategorias(); 
    this.cargarSuppliers();
    if (this.productoSeleccionado?.image) {
      this.imagePreview = this.productoSeleccionado.image;
    }
  }
  
  cargarCategorias(): void {
    this.categoryProductsService.getcategoryProducts().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  cargarSuppliers(): void {
    this.suppliersService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        console.log('Proveedores cargados:', this.suppliers);
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }


  editarProducto(): void {

    if (!this.productoSeleccionado.name || !this.productoSeleccionado.description) {
      console.error('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const formData = new FormData();

    const productoData = {
      supplier: { id: this.productoSeleccionado.supplier?.id },
      categoryProducts: { id: this.productoSeleccionado.categoryProducts?.id },
      image: this.productoSeleccionado.image,
      name: this.productoSeleccionado.name,
      description: this.productoSeleccionado.description,
      price: this.productoSeleccionado.price,
      amount: this.productoSeleccionado.amount,
      type: this.productoSeleccionado.type,
      codeProduct: this.productoSeleccionado.codeProduct,
      salePrice: this.productoSeleccionado.salePrice,
      purchasePrice: this.productoSeleccionado.purchasePrice,
      state: this.productoSeleccionado.state,
      composicionIsoprothiolane: this.productoSeleccionado.composicionIsoprothiolane,
      composicionAditivos: this.productoSeleccionado.composicionAditivos,
      descuento: this.productoSeleccionado.descuento,
      modelo: this.productoSeleccionado.modelo,
      fechaIngreso: this.productoSeleccionado.fechaIngreso,
      ubicacion: this.productoSeleccionado.ubicacion
    };

    console.log('Producto a editar:', productoData);
    formData.append('products', new Blob([JSON.stringify(productoData)], { type: 'application/json' }));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const url = `http://localhost:8091/api/products/edit/${this.productoSeleccionado.id}`;
    Swal.fire({
      title: 'Editando producto...',
      html: 'Por favor, espera mientras se completa el registro.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    this.http.put(url, formData, {
      observe: 'response',
      responseType: 'json',
      withCredentials : true,
    }).subscribe({
      next: (response: any) => {
        console.log('Respuesta:', response);
        if (response.status === 200 || response.status === 201) {
          Swal.fire({
                      title: 'Producto editado',
                      text: 'El producto se ha editado con éxito.',
                      icon: 'success',
                      confirmButtonText: 'Aceptar'
                    });
          this.actualizarProducto.emit(response.body);
          this.cerrarEditarModal();
          
        }
        
      },
      
      error: (err) => {
              Swal.close();
              if (err.status === 201) {
                Swal.fire({
                  title: 'Producto Editado',
                  text: 'El producto se editó, aunque ocurrió un error inesperado.',
                  icon: 'info',
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  window.location.reload();
                });
            
              } else {
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo editar el producto.',
                  icon: 'error',
                  confirmButtonText: 'Reintentar'
                });
              }
            }
    });
  }

}
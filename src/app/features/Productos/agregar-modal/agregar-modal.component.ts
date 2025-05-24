
import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CategoryProductsService } from '../../../services/category-products.service';
import { SuppliersService } from '../../../services/suppliers.service';

interface Producto {
  name: string;
  description: string;
  price: number;
  amount: number;
  type: string;
  image: string;
  supplier: {                         
    id: number; 
    name: string;                  
  };
  categoryProducts: {                
    id: number; 
    name: string;                       
  };
  codeProduct: string;
  salePrice: number;
  purchasePrice: number;
  state: string;
  composicionIsoprothiolane: string;
  composicionAditivos: string;
  descuento: number;
  modelo: string;
  fechaIngreso: string;
  ubicacion: string;
}

@Component({
  selector: 'app-agregar-modal',
  templateUrl: './agregar-modal.component.html',
  styleUrls: ['./agregar-modal.component.css']
})
export class AgregarModalComponent {
  @Output() cerrarModal: EventEmitter<void> = new EventEmitter();
  @Output() agregarProductoEvent: EventEmitter<any> = new EventEmitter();
  @Output() productoAgregado = new EventEmitter<any>();
  nuevoProducto: Producto = {
    
    name: "",
    description: "",
    price: 0.0,
    amount: 0,
    type: "",
    image: "",
    supplier: { id: 0, name: "" },
    categoryProducts: { id: 0, name: ""},
    codeProduct: "",
    salePrice: 0.0,
    purchasePrice: 0.0,
    state: "",
    composicionIsoprothiolane: "",
    composicionAditivos: "",
    descuento: 0,
    modelo: "",
    fechaIngreso: "",
    ubicacion: ""
  }

  productos: Producto[] = [];
  categorias: any[] = [];
  suppliers: any[] = [];
  selectedFile: any = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient,
    private categoryProductsService: CategoryProductsService,
    private suppliersService: SuppliersService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias(); 
    this.cargarSuppliers();
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

  agregarProducto(): void {
    if (!this.nuevoProducto.name || !this.nuevoProducto.description || !this.selectedFile) {
      console.error('Por favor, completa todos los campos obligatorios.');
      return;
    }
  
    const formData = new FormData();
   
    formData.append('products', new Blob([JSON.stringify(this.nuevoProducto)], {
      type: 'application/json'
    }));
    formData.append('image', this.selectedFile);
  
    const url = 'http://localhost:8091/api/products/register';
    Swal.fire({
      title: 'Registrando producto...',
      html: 'Por favor, espera mientras se completa el registro.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post(url, formData, {
      observe: 'response',  
      responseType: 'json',
      withCredentials: true  
    }).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response); 
      
        if (response.status === 201) {
          Swal.fire({
            title: 'Producto registrado',
            text: 'El producto se ha registrado con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            window.location.reload();
          });
          this.productos.push(response.body);
          this.productoAgregado.emit(response.body);
          this.resetForm();
          this.cerrar();
        }
      },
      error: (err) => {
        Swal.close();
        if (err.status === 201) {
          Swal.fire({
            title: 'Producto registrado',
            text: 'El producto se ha registrado con éxito.',
            icon: 'info',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            window.location.reload();
          });
          this.resetForm();
          this.cerrar();
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el producto.',
            icon: 'error',
            confirmButtonText: 'Reintentar'
          });
        }
      }
    });
  }

  resetForm(): void {
    this.nuevoProducto = {

      name: '',
      description: '',
      price: 0,
      amount: 0,
      type: '',
      image: '',
      supplier: { id: 0, name: ''},
      categoryProducts: { id: 0, name: ''},
      codeProduct: '',
      salePrice: 0,
      purchasePrice: 0,
      state: '',
      composicionIsoprothiolane: '',
      composicionAditivos: '',
      descuento: 0,
      modelo: '',
      fechaIngreso: '',
      ubicacion: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}
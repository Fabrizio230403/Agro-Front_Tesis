import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'app-detalles-modal',
  templateUrl: './detalles-modal.component.html',
  styleUrls: ['./detalles-modal.component.css']
})
export class DetallesModalComponent implements OnInit {
  productos: any[] = [];

  @Input() producto: any = {};  
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() actualizarProducto = new EventEmitter<any>(); 
  @Input() verDetalleVisible: boolean = true; 
  @Output() eliminarProductoEvento = new EventEmitter<number>();
  eliminarModalAbierto: boolean = false;
  editarModalVisible: boolean = false;
  detallesModalAbierto: boolean = true;
  productoSeleccionado: any = {};

  constructor(private productsService: ProductsService) {}  

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productsService.getProductos().subscribe(data => {
      this.productos = data;
    });
  }

  abrirEditarModal(producto: any) {
    this.productoSeleccionado = { ...producto }; 
    this.editarModalVisible = true; 
  }

  cerrarEditarModal() {
    this.editarModalVisible = false;
  }

  guardarProductoEditado() {
    this.actualizarProducto.emit(this.productoSeleccionado); 
    this.cerrarEditarModal(); 
  }

  abrirEliminarModal(producto: any) {
    this.productoSeleccionado = producto;
    this.eliminarModalAbierto = true;
  }

  getEstadoPorStock(stock: number): string {
    return stock >= 1 ? 'disponible' : 'no disponible';
  }

  getClasePorStock(stock: number): string {
    return stock >= 1 ? 'bg-green-600' : 'bg-red-600';
  }

  cerrarEliminarModal() {
    this.eliminarModalAbierto = false;
    this.productoSeleccionado = {}; 
  }

  eliminarProducto() {
    if (this.productoSeleccionado && this.productoSeleccionado.id) {
      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor, espera mientras se elimina el producto.',
        allowOutsideClick: false, 
        showConfirmButton: false, 
        willOpen: () => {
          Swal.showLoading(); 
        }
      });
  
      this.productsService.eliminarProducto(this.productoSeleccionado.id).subscribe({
        next: (response) => {
          this.productos = this.productos.filter(p => p.id !== this.productoSeleccionado.id);

          Swal.fire({
            title: 'Producto Eliminado',
            text: 'El producto se ha eliminado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            window.location.reload();
          });
  
          this.cargarProductos(); 

          this.cerrarEliminarModal(); 

        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el producto.',
            icon: 'error',
            confirmButtonText: 'Reintentar'
          });
        }
      });
    }
  }

  cerrarDetallesModal() {
    this.cerrarModal.emit();  
  }

  onActualizarProducto(productoActualizado: any) {
    console.log('Producto actualizado:', productoActualizado);
    
  }
}
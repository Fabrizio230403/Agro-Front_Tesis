 import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../../services/carrito.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-carrito-modal',
  templateUrl: './carrito-modal.component.html',
  styleUrls: ['./carrito-modal.component.css'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})

export class CarritoModalComponent {
  @Input() carrito: any[] = []; // Recibe el carrito desde el componente padre
  @Input() totalCarrito: number = 0; // Recibe el total del carrito desde el componente padre
  @Output() cerrarCarritoModal = new EventEmitter<void>(); // Emite evento para cerrar el modal
  carritoVisible: boolean = true// Método para cerrar el carrito
  cantidadCarrito: number = 0;

  constructor(
    private router: Router,
    private carritoService: CarritoService
  ) { }
  ngOnInit() {
    if (!this.carrito || this.carrito.length === 0) {
      this.carrito = this.carritoService.getCarrito(); // Carga del localStorage si está vacío
      this.actualizarTotal();

    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }


  seguirComprando() {
    this.cerrarCarrito(); // Cierra el modal
    this.router.navigate(['/productos']); // Redirige a donde se listan los productos
  }


  cerrarCarrito() {
    this.cerrarCarritoModal.emit(); // Emite el evento para cerrar el carrito
  }
  aceptarCarrito() {
    this.carritoService.setCarrito(this.carrito);
    this.router.navigate(['/ventas']); // Redirige a la ruta '/ventas'
  }

  // Método para eliminar un producto del carrito
  /*eliminarProducto(i: number) {
    this.carritoService.eliminarProducto(i);       // Actualiza en localStorage
    this.carrito = this.carritoService.getCarrito(); // Refresca en pantalla
  }*/

  eliminarProducto(item: any) {
    const index = this.carrito.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.carrito.splice(index, 1);
      this.carritoService.setCarrito(this.carrito);
      this.actualizarTotal();
    }
  }


  // Método para actualizar el total
  calcularTotal() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.cantidad * parseFloat(item.urchasePrice.replace('$', '')), 0);
  }

  // Método para agregar productos al carrito
  agregarACarrito(producto: any) {
    const itemEnCarrito = this.carrito.find(item => item.name === producto.name);

    if (itemEnCarrito) {
      itemEnCarrito.cantidad++; // Aumenta la cantidad si el producto ya está en el carrito
    } else {
      this.carrito.push({ ...producto, cantidad: 1 }); // Si no está, lo agrega con cantidad 1
    }
    this.carritoService.setCarrito(this.carrito);

    this.actualizarTotal(); // Actualiza el total después de agregar
    console.log(`${producto.name} ha sido agregado al carrito.`);
  }

  // Método para incrementar la cantidad de un producto en el carrito
  incrementarCantidad(item: any) {
    const itemEnCarrito = this.carrito.find(carritoItem => carritoItem.name === item.name);

    if (itemEnCarrito) {
      itemEnCarrito.cantidad++; // Incrementa la cantidad del producto
      this.actualizarTotal(); // Actualiza el total después de incrementar
      console.log(`Cantidad de ${item.name} incrementada a ${itemEnCarrito.cantidad}.`);
    }
  }

  // Método para decrementar la cantidad de un producto en el carrito
  decrementarCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
      this.actualizarTotal(); // Actualiza el total después de decrementar
    }
  }

  // Método para actualizar el total del carrito
  actualizarTotal() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.cantidad * item.salePrice, 0);
    this.carritoService.setCarrito(this.carrito);
    //this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.cantidad * parseFloat(item.precio.replace('$', '')), 0);
  }
  

  // Método para calcular el subtotal del carrito
  subtotal(): number {
    return this.carrito.reduce((acc, item) => acc + item.cantidad * item.salePrice, 0);

  }

  finalizarCompra() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío. No se puede finalizar la compra.');
      return;
    }

    // Aquí puedes implementar la lógica para finalizar la compra
    console.log('Finalizando compra con los siguientes artículos:', this.carrito);
    // Limpia el carrito después de finalizar la compra
    this.router.navigate(['/ventas']);
    this.carrito = [];
    this.totalCarrito = 0;

  }
}
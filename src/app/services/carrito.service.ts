import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoKey = 'carrito';
  private carritoSubject = new BehaviorSubject<any[]>(this.getCarrito());
  carritoObservable = this.carritoSubject.asObservable();
  constructor() { }

  setCarrito(items: any[]): void {
    localStorage.setItem(this.carritoKey, JSON.stringify(items));
    this.carritoSubject.next(items); // Notificar cambio

  }

  getCarrito(): any[] {
    const carrito = localStorage.getItem(this.carritoKey);
    return carrito ? JSON.parse(carrito) : [];
  }


 calcularSubtotal(): number {
    const carrito = this.getCarrito();
    return carrito.reduce((acc, item) => {
      const valorUnitario = item.salePrice / 1.18;
      return acc + item.cantidad * valorUnitario;
    }, 0);
  }

  calcularIGV(): number {
    return this.calcularSubtotal() * 0.18;
  }

  calcularTotalConIGV(): number {
    return this.calcularSubtotal() + this.calcularIGV();
  }

  calcularTotalSinIGV(): number {
    return this.calcularSubtotal();
  }


  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIGV();
  }

  agregarProducto(producto: any): void {
    let carrito = this.getCarrito();
    carrito.push(producto);
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  // En CarritoService
  actualizarCarrito(carrito: any[]) {
    localStorage.setItem('carrito', JSON.stringify(carrito)); // O el método que estés utilizando para guardar el carrito
  }

  eliminarProducto(index: number): void {
    const carrito = this.getCarrito();
    carrito.splice(index, 1); // Elimina el producto en esa posición
    this.setCarrito(carrito); // Actualiza localStorage
  }

  // Método para limpiar el carrito
  limpiarCarrito(): void {
    localStorage.removeItem(this.carritoKey); // Elimina el carrito del localStorage
  }



}
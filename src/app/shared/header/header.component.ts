  import { Component, EventEmitter, Output } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  isSidebarVisible = false;

  constructor(private carritoService: CarritoService) { }

  cantidadCarrito: number = 0;
  menuVisible: boolean = false;

  ngOnInit() {
    this.actualizarCantidad();

    // Escuchar cambios en el carrito usando el servicio
    this.carritoService.carritoObservable.subscribe(() => {
      this.actualizarCantidad();
    });
  } 

  actualizarCantidad() {
    const carrito = this.carritoService.getCarrito();
    this.cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  abrirCarrito() {
    console.log("Carrito abierto");
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarToggle.emit();
  }
   // Método para cerrar sesión
  cerrarSesion() {
    // Aquí deberías agregar la lógica de cierre de sesión (e.g., limpiar tokens, redirigir, etc.)
    console.log('Cerrando sesión...');
    // Redirigir a la página de login, por ejemplo:
    // this.router.navigate(['/login']);
  }

  // Método para alternar la visibilidad del menú de usuario
  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
}

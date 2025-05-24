import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Cliente } from '../../../models/client.model'; // o donde tengas la interfaz
import { CarritoService } from '../../../services/carrito.service';
import { ClienteService } from '../../../services/cliente.service';
import { InvoiceService, InvoiceRequest, InvoiceItem, InvoiceResponse } from '../../../services/invoice.service';
import { ProductsService } from '../../../services/products.service';
import { PaymentMethodService } from '../../../services/payment-method.service';  // Importar el servicio


@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent {
  isLoading: boolean = true;  // Nueva propiedad para el indicador de carga
  invoiceDetails: any = {};
  selectedInvoiceType: string = '';
  quantity: number = 1;
  invoiceDate: string = new Date().toISOString().split('T')[0];
  invoiceNumber: string = '';
  selectedProduct: any = null;
  carrito: any[] = [];
  codigoProducto: string = '';
  productoEncontrado: any = null;
  productos: any[] = [];  // Agregar una propiedad para almacenar los productos
  productoBusqueda: string = '';
  productosFiltrados: any[] = [];
  mostrarLista: boolean = false;

  totalGravada: number = 0;
  totalIgv: number = 0;
  totalFactura: number = 0;

  isSidebarVisible = true;
  dni: string = '';
  mostrarAgregarCliente = false;
  mostrarConfirmacionDni = false;

  paymentMethods: any[] = []; // Lista de métodos de pago
  selectedPaymentMethod: number | null = null; // Método de pago seleccionado
  operationNumber: string = ''; // Número de operación (si aplica)
  cuotas: number = 0; // Cuotas, debe ser 0 por defecto

  showPdfModal: boolean = false;
  pdfUrl: string = '';
  generatedInvoiceNumber: string = '';
  generatedInvoiceType: string = '';

  // Nuevos campos del cliente
  name: string = '';
  typeCustomer: string = '';
  documentType: string = '';
  documentNumber: string = '';
  address: string = '';
  phone: string = '';
  email: string = '';


  constructor(
    private carritoService: CarritoService,
    private clienteService: ClienteService,
    private invoiceService: InvoiceService,
    private productsService: ProductsService,
    private paymentMethodService: PaymentMethodService
  ) { }

  ngOnInit(): void {
    this.cargarMetodosDePago();
    this.carrito = this.carritoService.getCarrito();
    this.productsService.getProductos().subscribe((productos) => {
      if (productos && productos.length > 0) {
        console.log('Productos cargados:', productos);
        this.productos = productos;
      } else {
        console.log('No se encontraron productos');
      }
      this.isLoading = false;
    });
  }

  // Lógica para filtrar productos según el texto ingresado (por código o nombre)
  filtrarProductos() {
    const texto = this.productoBusqueda.trim().toLowerCase();
    if (texto.length < 3) {
      this.productosFiltrados = [];
      this.mostrarLista = false;
      this.productoEncontrado = null;
      return;
    }

    this.productosFiltrados = this.productos.filter(p =>
      p.codeProduct.toLowerCase().includes(texto) || p.name.toLowerCase().includes(texto)
    );

    this.mostrarLista = this.productosFiltrados.length > 0;
  }

  // Al seleccionar un producto de la lista
  seleccionarProducto(producto: any) {
    this.productoEncontrado = producto;
    this.productoBusqueda = `${producto.codeProduct} - ${producto.name}`;
    this.mostrarLista = false;
    this.quantity = 1;
  }

  // Para cerrar la lista al perder foco (con un pequeño delay para poder hacer click en la lista)
  cerrarLista() {
    setTimeout(() => {
      this.mostrarLista = false;
    }, 200);
  }


  cargarMetodosDePago() {
    this.paymentMethodService.obtenerMetodosDePago().subscribe((data: any[]) => {
      this.paymentMethods = data;
    });
  }

  // Cambiar la cuota según el método de pago
  onPaymentMethodChange() {
    this.selectedPaymentMethod = Number(this.selectedPaymentMethod);
    if (this.selectedPaymentMethod === 1) { // Suponiendo que 1 es Crédito
      this.cuotas = 1;
    } else {
      this.cuotas = 0;
    }
  }

  onTipoComprobanteChange(tipo: string) {
    this.selectedInvoiceType = tipo;
    this.dni = ''; // Limpiar campo de texto
    this.name = '';
    this.typeCustomer = '';
    this.documentType = '';
    this.documentNumber = '';
    this.address = '';
    this.phone = '';
    this.email = '';
    this.cargarNumeroFactura();
  }

  onProductSelect(product: any) {
    this.selectedProduct = product;
    this.quantity = 1;
  }

  buscarProductoPorCodigo() {
    if (this.isLoading) {
      alert('Productos están siendo cargados. Por favor, espera.');
      return;
    }

    if (!this.codigoProducto.trim()) {
      alert('Por favor ingrese un código de producto válido');
      return;
    }

    //const producto = this.productos.find(p => p.codeProduct === this.codigoProducto.trim());
    const producto = this.productos.find(p => p.codeProduct.toLowerCase() === this.codigoProducto.trim().toLowerCase());
    if (producto) {
      this.productoEncontrado = producto;
    } else {
      this.productoEncontrado = null;
      alert('Producto no encontrado');
    }
  }

  // Función para cerrar modal
  cerrarModal() {
    this.productoEncontrado = null;
    this.productoBusqueda = '';
    this.quantity = 1;
  }

  agregarProductoDesdeModal() {
    if (this.quantity < 1) return;

    // Verificar si el producto ya existe en el carrito
    const productoExistente = this.carrito.find(item => item.codeProduct === this.productoEncontrado.codeProduct);

    if (productoExistente) {
      // Si el producto ya está en el carrito, actualizamos la cantidad
      productoExistente.cantidad += this.quantity;
      this.carritoService.actualizarCarrito(this.carrito); // Actualizar el carrito con la nueva cantidad
    } else {
      const productoConCantidad = {
        ...this.productoEncontrado,
        cantidad: this.quantity
      };
      this.carritoService.agregarProducto(productoConCantidad);
    }

    this.carrito = this.carritoService.getCarrito(); // Recargar el carrito después de actualizar
    console.log('Producto agregado:', this.productoEncontrado);
    this.cerrarModal();
  }


  private cargarNumeroFactura() {
    const tipo = this.selectedInvoiceType === 'Factura' ? 'FACTURA' : 'BOLETA';

    this.invoiceService.obtenerNumeroFactura(tipo).subscribe({
      next: (numeroFactura) => {
        this.invoiceNumber = numeroFactura;
      },
      error: (err) => {
        console.error('Error al obtener el número de factura:', err);
        Swal.fire('Error', 'No se pudo obtener el número de factura', 'error');
      }
    });
  }

  subtotal(): number {
    return this.carritoService.calcularSubtotal();
  }

  igv(): number {
    return this.carritoService.calcularIGV();
  }

  total(): number {
    if (this.selectedInvoiceType === 'Factura') {
      return this.carritoService.calcularTotalConIGV();
    } else {
      return this.carritoService.calcularTotalSinIGV();
    }
  }

  aumentarCantidad(index: number): void {
    this.carrito[index].cantidad += 1;
    this.carritoService.setCarrito(this.carrito);
  }

  disminuirCantidad(index: number): void {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad -= 1;
      this.carritoService.setCarrito(this.carrito);
    }
  }

  eliminarItem(item: any): void {
    this.carrito = this.carrito.filter(p => p.name !== item.name);
    this.carritoService.setCarrito(this.carrito); // actualizamos el servicio también
  }

  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index); // elimina en localStorage
    this.carrito = this.carritoService.getCarrito();
  }


  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    setTimeout(() => this.updateChartsSize(), 300);
  }

  private updateChartsSize() {
  }



  validarCliente() {
    if (!this.documentType || !this.documentNumber || !this.name || !this.address) {
      Swal.fire('Error', 'Complete todos los campos del cliente', 'warning');
      return false;
    }
    return true;
  }

  enviarFactura() {
    if (this.carrito.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un producto al carrito.', 'warning');
      return;
    }

    if (!this.validarCliente()) return;

    const productoConStockInsuficiente = this.carrito.find(item => {
      const producto = this.productos.find(p => p.codeProduct === item.codeProduct);
      return producto && item.cantidad > producto.amount;
    });

    if (productoConStockInsuficiente) {
      Swal.fire('Stock insuficiente', `El producto ${productoConStockInsuficiente.name} no tiene stock suficiente.`, 'warning');
      return;
    }

    const productos: InvoiceItem[] = this.carrito.map(item => {
      const cantidad = item.cantidad || 0;
      const valorSinIGV = +(item.salePrice / 1.18).toFixed(2); // valor base sin IGV
      const igv = +(valorSinIGV * 0.18 * cantidad).toFixed(2);
      const subtotal = +(valorSinIGV * cantidad).toFixed(2); // base gravada
      const totalItem = +(subtotal + igv).toFixed(2); // total con IGV

      console.log(`Producto: ${item.name}, Subtotal: ${subtotal}, IGV: ${igv}, Total: ${totalItem}`);

      return {
        unidadDeMedida: 'Unidad',
        codigo: item.codeProduct,
        descripcion: item.name,
        cantidad,
        valorUnitario: valorSinIGV,
        precioUnitario: item.salePrice, // <-- AQUÍ CAMBIA
        subtotal,
        igv,
        total: totalItem
      };
    });

    console.log('Productos antes del cálculo de totales:', productos);


    const totalGravada = +productos.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
    const totalIgv = +productos.reduce((sum, item) => sum + item.igv, 0).toFixed(2);
    const totalFactura = +(totalGravada + totalIgv).toFixed(2);

    const tipoDeComprobante = this.selectedInvoiceType === 'Factura' ? 1 :
      this.selectedInvoiceType === 'Boleta' ? 3 : 0;

    const serie = this.selectedInvoiceType === 'Factura' ? 'F001' :
      this.selectedInvoiceType === 'Boleta' ? 'B001' : '';

    if (tipoDeComprobante === 0) {
      Swal.fire('Error', 'Seleccione un tipo de comprobante válido', 'warning');
      return;
    }

    if (isNaN(totalGravada) || isNaN(totalIgv) || isNaN(totalFactura)) {
      console.error('Error: Totales no válidos.');
      return;
    }

    console.log('Total Gravada:', totalGravada);
    console.log('Total IGV:', totalIgv);
    console.log('Total Factura:', totalFactura);

    const moneda: number = 1;

    if (this.selectedPaymentMethod === null) {
      Swal.fire('Error', 'Seleccione un método de pago', 'warning');
      return;
    }

    const factura: InvoiceRequest = {
      tipoDeComprobante,
      serie,
      clienteTipoDocumento: this.documentType,
      clienteNumeroDeDocumento: this.documentNumber,
      clienteDenominacion: this.name,
      clienteDireccion: this.address,
      fechaDeEmision: new Date().toISOString().split('T')[0],
      moneda: moneda,
      porcentajeDeIgv: 18,
      totalGravada,
      totalIgv: tipoDeComprobante === 1 ? totalIgv : 0,
      total: tipoDeComprobante === 1 ? totalFactura : totalGravada,
      items: productos.map(item => ({
        ...item,
        igv: tipoDeComprobante === 1 ? item.igv : 0,
        total: tipoDeComprobante === 1 ? item.total : item.subtotal
      })),
      paymentMethod: this.selectedPaymentMethod,
      operationNumber: this.operationNumber,
      cuotas: this.cuotas
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Generando tu comprobante, esto tomará unos segundos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.invoiceService.enviarFactura(factura).subscribe({
      next: (response: InvoiceResponse) => {
        Swal.close();
        const mensaje = this.selectedInvoiceType === 'Factura'
          ? '¡Tu factura fue enviada con éxito!'
          : '¡Tu boleta fue enviada con éxito!';

        Swal.fire('¡Todo listo!', mensaje, 'success').then(() => {

          this.carrito.forEach(item => {
            const producto = this.productos.find(p => p.codeProduct === item.codeProduct);
            if (producto) {
              producto.amount -= item.cantidad;
            }
          });
          this.pdfUrl = response.enlaceDelPdf;
          this.generatedInvoiceNumber = `${response.serie} -${response.numero}`;
          this.generatedInvoiceType = response.tipo;

          this.carritoService.limpiarCarrito();
          this.carrito = this.carritoService.getCarrito();
          this.limpiarCamposVenta();

          this.showPdfModal = true;

        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire('Error', 'Hubo un problema al procesar tu comprobante. Por favor, inténtalo nuevamente.', 'error');
        console.error(err);
      }
    });
  }

  closePdfModal() {
    this.showPdfModal = false;
    this.pdfUrl = '';
    this.generatedInvoiceNumber = '';
    this.generatedInvoiceType = '';
    // Opcionalmente, podrías querer recargar el número de factura aquí si el usuario va a generar otra inmediatamente
    // this.cargarNumeroFactura(); 
  }

  private limpiarCamposVenta() {
    // Limpiar el carrito
    this.carritoService.limpiarCarrito();
    this.carrito = [];

    // Limpiar selección de producto
    this.codigoProducto = '';
    this.productoEncontrado = null;
    this.quantity = 1;
    this.totalGravada = 0;
    this.totalIgv = 0;
    this.totalFactura = 0;

    // Limpiar los datos del cliente
    this.dni = '';
    this.name = '';
    this.typeCustomer = '';
    this.documentType = '';
    this.documentNumber = '';
    this.address = '';
    this.phone = '';
    this.email = '';

    // Limpiar datos de factura
    this.selectedInvoiceType = '';
    this.invoiceNumber = '';
    this.invoiceDate = new Date().toISOString().split('T')[0];
    this.mostrarAgregarCliente = false;
    this.mostrarConfirmacionDni = false;


  }

  cancelarVenta(): void {
    this.limpiarCamposVenta();
    Swal.fire('Operación cancelada', 'Todos los campos han sido reiniciados.', 'info');
  }


  buscarCliente() {
    const esFactura = this.selectedInvoiceType === 'Factura';

    // Validación: solo números y longitud según tipo
    const soloNumeros = /^\d+$/;
    const longitudValida = esFactura ? this.dni.length === 11 : this.dni.length === 8;

    if (!this.dni || !soloNumeros.test(this.dni) || !longitudValida) {
      return; // No hacer nada si no cumple
    }

    this.clienteService.getClientePorDni(this.dni).subscribe(
      (cliente) => {
        this.name = cliente.name;
        this.typeCustomer = cliente.typeCustomer;
        this.documentType = cliente.documentType;
        this.documentNumber = cliente.documentNumber;
        this.address = cliente.address;
        this.phone = cliente.phone;
        this.email = cliente.email;
        this.mostrarAgregarCliente = false;
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Cliente no encontrado',
          text: '¿Desea agregar un nuevo cliente?',
          showCancelButton: true,
          confirmButtonText: 'Sí, agregar',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.isConfirmed) {
            this.documentNumber = this.dni;
            this.resetFormExceptDNI();
            this.mostrarAgregarCliente = true;
          }
        });
      }
    );
  }

  permitirSoloNumeros(event: KeyboardEvent) {
    const key = event.key;
    if (!/^\d$/.test(key)) {
      event.preventDefault(); // Bloquea cualquier tecla que no sea número
    }
  }

  clienteAgregadoHandler(cliente: Cliente) {
    // Actualiza el DNI con el número de documento del cliente agregado
    this.dni = cliente.documentNumber;

    // Asigna directamente los demás campos para mostrar el detalle sin llamar a buscarCliente()
    this.name = cliente.name;
    this.typeCustomer = cliente.typeCustomer;
    this.documentType = cliente.documentType;
    this.documentNumber = cliente.documentNumber;
    this.address = cliente.address;
    this.phone = cliente.phone;
    this.email = cliente.email;

    // Oculta el modal
    this.mostrarAgregarCliente = false;
  }

  abrirAgregarCliente() {
    this.mostrarAgregarCliente = true;
  }

  cerrarAgregarCliente() {
    this.mostrarAgregarCliente = false;
    this.resetForm();
  }

  agregarCliente() {
    if (!this.documentNumber || !this.name) {
      this.mostrarError("Todos los campos obligatorios deben completarse.");
      return;
    }

    console.log(`Cliente agregado: ${this.name}, DNI: ${this.documentNumber}`);
    this.cerrarAgregarCliente();

    Swal.fire({
      icon: 'success',
      title: 'Registro guardado',
      text: 'El cliente ha sido guardado correctamente',
      confirmButtonText: 'OK'
    }).then(() => {
      this.mostrarConfirmacionDni = true;
    });
  }

  confirmarDniCliente() {
    console.log(`DNI confirmado: ${this.documentNumber}`);
    this.mostrarConfirmacionDni = false;
  }

  cancelar() {
    this.cerrarAgregarCliente();
  }

  mostrarError(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonText: 'OK',
      confirmButtonColor: '#d33'
    });
  }


  private resetForm() {
    this.name = '';
    this.typeCustomer = '';
    this.documentType = '';
    this.documentNumber = '';
    this.address = '';
    this.phone = '';
    this.email = '';
  }

  private resetFormExceptDNI() {
    this.name = '';
    this.typeCustomer = '';
    this.documentType = '';
    this.address = '';
    this.phone = '';
    this.email = '';
  }
}

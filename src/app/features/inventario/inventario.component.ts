 import { Component, OnInit, Output,Input, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const apiUrl = 'http://localhost:8091/api/products';
const movementHistoryApiUrlBase = 'http://localhost:8091';
const kardexApiUrl = 'http://localhost:8091/api/products/kardex';

interface Product {
  id: number;
  name: string;
  description: string;
  amount: number;
  type: string;
  image: string;
  supplierId: string;
  categoryProducts: { name: string }[];
  supplier: { name: string }[];
  codeProduct: string;
  salePrice: number;
  purchasePrice: number;
  state?: string;
  descuento?: string;
  fechaIngreso?: string;
  ubicacion?: string;
}

interface KardexProductSummary {
  productId: number;
  productName: string;
  productCode: string;
  totalQuantityEntrada: number; // El JSON muestra números, así que number está bien
  totalQuantitySalidaPositiva: number;
  stockActualEnTablaProduct: number; // Esto es p.amount
  valorEntradas: number;
  valorSalidas: number;
  valorTotalEntradas: number;
  valorTotalSalidas: number;
  valorStockActualCalculadoTablaProduct: number; // Esto es ABS(p.amount * p.price)
  fechaUltimoMovimiento: string; // El JSON lo muestra como string "YYYY-MM-DD HH:MM:SS.F"
  // Puedes añadir aquí el resultado de getStockActualEnTablaProductAsBigDecimal() si lo expones
  // stockActualEnTablaProductAsBigDecimal: number;
}

interface ProductMovement {
  id: number;
  balanceAfter?: number;
  movementCost: number;
  movementDate: string; // Correcto, coincide con el JSON
  movementType: string;
  quantity: number;     // Correcto, coincide con el JSON
  unitCost: number;
  productId: number;
  // description?: string; // Si no viene en el JSON, es bueno que sea opcional
}

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  allProducts: Product[] = []; 
  displayedProducts: Product[] = []; 
  productIdsInTable = new Set<number>(); 
  searchCode: string = ''; 
  isSidebarVisible: boolean = true;
  availableCategories: string[] = ['Fertilizantes', 'Pesticidas'];
  selectedCategory: string = '';
  categories: { id: string; name: string }[] = [];
  selectedProducts: boolean[] = [];
  showCategorySearch: boolean = false;
  searchCategory: string ='';

  kardexProductSummaries: KardexProductSummary[] = [];
  displayedKardexSummaries: KardexProductSummary[] = [];

  showMovementHistoryModal: boolean = false;
  selectedProductForHistory: KardexProductSummary | null = null;
  productMovements: ProductMovement[] = [];
  loadingMovements: boolean = false;

  kardexSearchTerm: string = '';

  kardexCurrentPage: number = 1;
  kardexItemsPerPage: number = 8;

  kardexSortColumn: keyof KardexProductSummary | '' = 'productName';
  kardexSortDirection: 'asc' | 'desc' = 'asc';

  showAddStockModal: boolean = false;
  productSelectedForStock: KardexProductSummary | null = null;
  

  @Output() sidebarToggle = new EventEmitter<void>();
  @Input() tableData: any[] = []; // Recibe los datos de la tabla
  @Output() onClose = new EventEmitter<void>();

  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDisplayedProducts(); 
    this.fetchProducts();         
    this.fetchKardexSummaries();
  }
  //this.filterByCategory();

  fetchKardexSummaries(): void {
    this.http.get<KardexProductSummary[]>(kardexApiUrl, { withCredentials: true }).subscribe(
      (data) => {
        this.kardexProductSummaries = data;
        this.displayedKardexSummaries = [...this.kardexProductSummaries]; // Inicializa la lista visible
        console.log('Datos del Kardex cargados:', this.kardexProductSummaries);
        // Aquí podrías querer guardar this.kardexProductSummaries en localStorage si necesitas persistencia
        // similar a como lo haces con displayedProducts, pero para una clave diferente.
      },
      (error) => {
        console.error('Error al cargar el resumen del Kardex:', error);
        Swal.fire('Error', 'Error al cargar el resumen del Kardex. Intente nuevamente.', 'error');
      }
    );
  }

  getTotalKardexPages(): number {
    if (!this.displayedKardexSummaries || this.displayedKardexSummaries.length === 0) {
      return 0;
    }
    return Math.ceil(this.displayedKardexSummaries.length / this.kardexItemsPerPage);
  }

  // Métodos para cambiar de página
  cambiarPaginaKardex(direccion: 'anterior' | 'siguiente' | number): void {
    const totalPages = this.getTotalKardexPages();

    if (typeof direccion === 'number') {
      // Si se pasa un número de página directamente (para futuros botones numéricos)
      if (direccion >= 1 && direccion <= totalPages) {
        this.kardexCurrentPage = direccion;
      }
    } else if (direccion === 'anterior') {
      if (this.kardexCurrentPage > 1) {
        this.kardexCurrentPage--;
      }
    } else if (direccion === 'siguiente') {
      if (this.kardexCurrentPage < totalPages) {
        this.kardexCurrentPage++;
      }
    }
    // No es necesario volver a filtrar o cargar datos aquí,
    // el pipe 'paginate' reaccionará al cambio de 'kardexCurrentPage'.
  }

  // NUEVO: Exportar datos del Kardex a Excel
  exportKardexToExcel(): void {
    if (this.displayedKardexSummaries.length === 0) {
        Swal.fire('Aviso', 'No hay datos de kardex para exportar.', 'info');
        return;
    }
    const formattedData = this.displayedKardexSummaries.map((item, index) => ({
      'N°': index + 1,
      'ID Prod.': item.productId,
      'Código': item.productCode,
      'Nombre Producto': item.productName,
      'Stock (Tabla Prod.)': item.stockActualEnTablaProduct,
      'Total Entradas (Q)': item.totalQuantityEntrada,
      'Total Salidas (Q)': item.totalQuantitySalidaPositiva,
      'Valor Entradas': item.valorTotalEntradas,
      'Valor Salidas': item.valorTotalSalidas,
      'Valor Stock (Calculado)': item.valorStockActualCalculadoTablaProduct,
      'Fecha Últ. Mov.': item.fechaUltimoMovimiento
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ResumenKardex');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'reporte_kardex.xlsx');
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  // NUEVO: Exportar datos del Kardex a PDF
  exportKardexToPDF(): void {
    if (this.displayedKardexSummaries.length === 0) {
        Swal.fire('Aviso', 'No hay datos de kardex para exportar.', 'info');
        return;
    }
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    doc.text('Reporte Resumen de Kardex de Productos', 15, 10);

    (doc as any).autoTable({
      head: [['N°', 'ID', 'Código', 'Nombre', 'Stock Tabla', 'Q Entr.', 'Q Sal.', 'Val. Entr.', 'Val. Sal.', 'Val. Stock Calc.', 'Últ. Mov.']],
      body: this.displayedKardexSummaries.map((item, index) => [
        index + 1,
        item.productId,
        item.productCode,
        item.productName,
        item.stockActualEnTablaProduct,
        item.totalQuantityEntrada,
        item.totalQuantitySalidaPositiva,
        item.valorTotalEntradas.toFixed(4), // Ajustar formato si es necesario
        item.valorTotalSalidas.toFixed(4),
        item.valorStockActualCalculadoTablaProduct.toFixed(2),
        item.fechaUltimoMovimiento
      ]),
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }, // Un azul diferente
      styles: { fontSize: 7, cellPadding: 1.5 },
      columnStyles: {
        // Puedes ajustar anchos si es necesario
        // 0: { cellWidth: 10 }, // N°
        // 3: { cellWidth: 40 }, // Nombre
      }
    });
    // ... (lógica para abrir/descargar PDF igual que tu método original) ...
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const previewWindow = window.open();
    if (previewWindow) {
      previewWindow.document.write(`<html><head><title>Vista previa Kardex PDF</title></head><body style="margin:0;"><embed src="${pdfUrl}" width="100%" height="100%" type="application/pdf"></body></html>`);
      previewWindow.document.close();
    }
  }

  openMovementHistoryModal(productId: number): void {
    this.selectedProductForHistory = this.kardexProductSummaries.find(p => p.productId === productId) || null;
    if (!this.selectedProductForHistory) return;

    this.productMovements = [];
    this.loadingMovements = true;
    this.showMovementHistoryModal = true;

    // La URL se construirá como: http://localhost:8091/2/movements (si productId es 2)
    const url = `${movementHistoryApiUrlBase}/${productId}/movements`;
    console.log('Llamando a API de historial de movimientos:', url);

    this.http.get<ProductMovement[]>(url, { withCredentials: true })
      .subscribe(
        (data) => {
          this.productMovements = data;
          this.loadingMovements = false;
          console.log(`Movimientos para producto ${productId}:`, data);
        },
        (error) => {
          console.error(`Error al cargar movimientos para el producto ${productId}:`, error);
          Swal.fire('Error', `No se pudieron cargar los movimientos para el producto ID ${productId}.`, 'error');
          this.loadingMovements = false;
        }
      );
  }

  closeMovementHistoryModal(): void {
    this.showMovementHistoryModal = false;
    this.selectedProductForHistory = null;
    this.productMovements = [];
    this.loadingMovements = false; // Añadir esto por si acaso
  }

  openAddStockModal(productData: KardexProductSummary): void {
    this.productSelectedForStock = productData;
    this.showAddStockModal = true;
    console.log('Abriendo modal para añadir stock a:', productData.productName);
  }

  closeAddStockModal(): void {
    this.showAddStockModal = false;
    this.productSelectedForStock = null;
  }

  handleStockAdded(eventData: { productName: string; addedQuantity: number; /* otros datos */ }): void {
    console.log('Stock añadido para el producto:', eventData.productName, 'Cantidad:', eventData.addedQuantity);
    this.closeAddStockModal();
    this.fetchKardexSummaries(); 
    Swal.fire('Éxito', `Se añadió stock a ${eventData.productName}. Cantidad añadida: ${eventData.addedQuantity}`, 'success');
  }

  applyKardexFilters(): void {
    let filtered = [...this.kardexProductSummaries];
    if (this.kardexSearchTerm) {
      const searchTermLower = this.kardexSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTermLower) ||
        item.productCode.toLowerCase().includes(searchTermLower)
      );
    }
    // Aplicar otros filtros si los tienes...
    this.displayedKardexSummaries = filtered;
  }

  clearKardexFilters(): void {
    this.kardexSearchTerm = '';
    this.displayedKardexSummaries = [...this.kardexProductSummaries];
  }

  fetchProducts(): void {
    const deletedProductIds = this.getDeletedProductIds();
    this.http.get<Product[]>(apiUrl, {withCredentials: true}).subscribe(
      (data) => {
        this.allProducts = data.filter(product => !deletedProductIds.includes(product.id));
        this.displayedProducts = [...this.allProducts];
        this.productIdsInTable = new Set(this.displayedProducts.map((product) => product.id));
        this.saveDisplayedProducts();
        this.filterByCategory();

      },
      (error) => {
        console.error('Error:', error);
        Swal.fire('Error', 'Error al cargar los datos. Intente nuevamente más tarde.', 'error');
      }
    );
  }
  
  
  getDeletedProductIds(): number[] {
    const deletedIds = localStorage.getItem('deletedProductIds');
    return deletedIds ? JSON.parse(deletedIds) : [];
  }
  exportDocuments(): void {
    const formattedData = this.displayedProducts.map((product, index) => ({
      N: index + 1,
      Nombre: product.name || 'N/A',
      Descripción: product.description || 'N/A',
      Cantidad: product.amount || 0,
      Tipo: product.type || 'N/A',
      Proveedor: this.getSupplier(product).map(sup => sup.name).join(', ') || 'N/A',
      Categoría: this.getCategoryProducts(product).map(cat => cat.name).join(', ') || 'N/A',
      Código: product.codeProduct || 'N/A',
      'Precio de Venta': product.salePrice ? product.salePrice.toFixed(2) : '0.00',
      'Precio de Compra': product.purchasePrice ? product.purchasePrice.toFixed(2) : '0.00',
      Descuento: product.descuento || '0%',
      'Fecha de Ingreso': product.fechaIngreso || 'N/A',
      Ubicación: product.ubicacion || 'N/A'
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reporte_inventario.xlsx');
  } 
  closeModal() {
    this.onClose.emit();
  }
  
  exportDocumentsPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape', // Horizontal
      unit: 'mm',
      format: 'a4',
    });
  
    // Título
    doc.text('Reporte de Inventario', 15, 10);
  
    // Generar tabla
    (doc as any).autoTable({
      head: [
        [
          'N°',
          'Nombre',
          'Descripción',
          'Cantidad',
          'Tipo',
          'Proveedor',
          'Categoría',
          'Código',
          'Precio de Venta',
          'Precio de Compra',
          'Descuento',
          'Fecha de Ingreso',
          'Ubicación',
        ],
      ],
      body: this.displayedProducts.map((product, index) => [
        index + 1,
        product.name || 'N/A',
        product.description || 'N/A',
        product.amount || 0,
        product.type || 'N/A',
        this.getSupplier(product).map((sup) => sup.name).join(', ') || 'N/A',
        this.getCategoryProducts(product).map((cat) => cat.name).join(', ') || 'N/A',
        product.codeProduct || 'N/A',
        product.salePrice ? product.salePrice.toFixed(2) : '0.00',
        product.purchasePrice ? product.purchasePrice.toFixed(2) : '0.00',
        product.descuento || '0%',
        product.fechaIngreso || 'N/A',
        product.ubicacion || 'N/A',
      ]),
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [100, 149, 237] }, // Color azul para encabezados
      styles: { fontSize: 8 }, // Ajustar tamaño de fuente
    });
  
    // Convertir el PDF a un objeto Blob para la vista previa
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
  
    // Abrir una nueva ventana o pestaña para la vista previa
    const previewWindow = window.open();
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Vista previa del PDF</title>
          </head>
          <body style="margin: 0; display: flex; flex-direction: column; align-items: center;">
            <embed src="${pdfUrl}" width="100%" height="90%" type="application/pdf" />
            <button onclick="window.close()" style="margin-top: 10px; padding: 10px 20px; font-size: 16px;">Cerrar</button>
          </body>
        </html>
      `);
      previewWindow.document.close();
    } else {
      console.error('No se pudo abrir la ventana de vista previa.');
    }
  }
  


  
extractCategories(): void {
  const categoriesSet = new Set<string>();
  this.allProducts.forEach(product => {
    if (product.categoryProducts && Array.isArray(product.categoryProducts)) {
      product.categoryProducts.forEach(category => {
        categoriesSet.add(category.name); 
      });
    }
  });
  this.availableCategories = Array.from(categoriesSet); 
}

filterByCategory(): void {
  if (this.selectedCategory) {
    localStorage.setItem('selectedCategory', this.selectedCategory); // Guardar categoría seleccionada

    const filteredProducts = this.allProducts.filter(product =>
      product.categoryProducts.some(category => category.name === this.selectedCategory)
    );
    filteredProducts.forEach(product => {
      if (!this.productIdsInTable.has(product.id)) {
        this.addRowToTable(product);  
      }
    });
  } else {
    this.displayedProducts = [...this.allProducts];
    this.productIdsInTable = new Set(this.displayedProducts.map(product => product.id));  // Asegurar que todos los productos estén en la tabla
  }
}
clearCategorySelection(): void {
  this.selectedCategory = '';
  localStorage.removeItem('selectedCategory'); // Limpiar categoría del localStorage
  this.filterByCategory(); // Aplicar filtro vacío
}



addRowToTable(product: Product): void {
  const deletedIds = this.getDeletedProductIds();

  // Si el producto fue eliminado, elimina su ID de la lista de eliminados
  if (deletedIds.includes(product.id)) {
    const updatedDeletedIds = deletedIds.filter(id => id !== product.id);
    this.saveDeletedProductIds(updatedDeletedIds);
  }

  // Verifica si el producto ya está en la tabla
  if (this.productIdsInTable.has(product.id)) {
    Swal.fire('Aviso', 'El producto ya está en la tabla.', 'info');
    return;
  }

  // Agregar el producto a la tabla
  this.displayedProducts.push(product);
  this.productIdsInTable.add(product.id);
  this.selectedProducts.push(false);
  this.saveDisplayedProducts();

  Swal.fire('Éxito', 'Producto añadido a la tabla.', 'success');
}

  
  
  
  saveDisplayedProducts(): void {
    localStorage.setItem('displayedProducts', JSON.stringify(this.displayedProducts));
    //console.log("Productos guardados en localStorage:", this.displayedProducts);
  }
  saveDeletedProductIds(deletedIds: number[]): void {
    //const uniqueIds = Array.from(new Set(deletedIds)); // Eliminar duplicados
    localStorage.setItem('deletedProductIds', JSON.stringify(deletedIds));
  }
  loadDisplayedProducts(): void {
    const storedProducts = localStorage.getItem('displayedProducts');
    const deletedProductIds = this.getDeletedProductIds();
  
    if (storedProducts) {
      this.displayedProducts = JSON.parse(storedProducts).filter(
        (product: Product) => !deletedProductIds.includes(product.id)
      );
      this.productIdsInTable = new Set(this.displayedProducts.map((product) => product.id));
    } else {
      this.displayedProducts = [];
    }
  }
  
  
  
  
  
  

  // Obtener las categorías del producto
  getCategoryProducts(product: Product): { name: string }[] {
    return Array.isArray(product.categoryProducts) ? product.categoryProducts : [product.categoryProducts];
  }
  getSupplier(product: Product): { name: string }[] {
    return Array.isArray(product.supplier) ? product.supplier : [product.supplier];
  }
   // Function to toggle all checkboxes
   toggleAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedProducts = this.displayedProducts.map(() => isChecked);
  }

  // Add a function to handle individual product selection if needed
  getSelectedProducts(): Product[] {
    return this.displayedProducts.filter((_, index) => this.selectedProducts[index]);
  }

  confirmDeleteSelected(): void {
    const selectedProducts = this.getSelectedProducts();
    if (selectedProducts.length === 0) {
      Swal.fire('Aviso', 'No hay productos seleccionados para eliminar.', 'info');
      return;
    }
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminarán ${selectedProducts.length} producto(s) de la tabla.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeSelectedProducts();
        Swal.fire('Eliminado', 'Los productos seleccionados fueron eliminados.', 'success');
      }
    });
  }
  removeSelectedProducts(): void {
    const remainingProducts: Product[] = [];
    const deletedIds = this.getDeletedProductIds();  // Obtener productos eliminados
    
    this.displayedProducts.forEach((product, index) => {
      if (!this.selectedProducts[index]) {
        remainingProducts.push(product); // Mantén productos no seleccionados
      } else {
        this.productIdsInTable.delete(product.id); // Eliminar el producto de la tabla
        deletedIds.push(product.id); // Agregar el ID eliminado a la lista
      }
    });
    
    this.displayedProducts = remainingProducts;
    this.selectedProducts = this.displayedProducts.map(() => false);
    this.saveDisplayedProducts();  // Guarda los productos visibles
    this.saveDeletedProductIds([...new Set(deletedIds)]); // Asegúrate de eliminar duplicados
  }
  
  
  searchProduct(): void {
    if (!this.searchCode.trim()) {
      Swal.fire('Aviso', 'Por favor, ingrese un código de producto.', 'warning');
      return;
    }
  
    const searchCodeNormalized = this.searchCode.trim().toLowerCase();
  
    // Buscar en allProducts primero
    let product = this.allProducts.find(
      (p) => p.codeProduct && p.codeProduct.toLowerCase() === searchCodeNormalized
    );
  
    if (product) {
      // Si el producto ya está eliminado, lo recuperamos
      const deletedIds = this.getDeletedProductIds();
      if (deletedIds.includes(product.id)) {
        const updatedDeletedIds = deletedIds.filter((id) => id !== product?.id);
        this.saveDeletedProductIds(updatedDeletedIds);
      }
  
      // Añadir el producto a la tabla si no está ya
      if (!this.productIdsInTable.has(product.id)) {
        this.addRowToTable(product);
        Swal.fire('Éxito', 'Producto añadido a la tabla.', 'success');
      } else {
        Swal.fire('Aviso', 'El producto ya está en la tabla.', 'info');
      }
    } else {
      // Buscar en la API si no está en allProducts
      this.http.get<Product[]>(apiUrl, {withCredentials: true}).subscribe(
        (products) => {
          product = products.find(
            (p) => p.codeProduct && p.codeProduct.toLowerCase() === searchCodeNormalized
          );
  
          if (product) {
            // Si el producto está eliminado, recuperarlo
            const deletedIds = this.getDeletedProductIds();
            if (deletedIds.includes(product.id)) {
              const updatedDeletedIds = deletedIds.filter((id) => id !== product?.id);
              this.saveDeletedProductIds(updatedDeletedIds);
            }
  
            // Añadir a la tabla
            if (!this.productIdsInTable.has(product.id)) {
              this.addRowToTable(product);
              Swal.fire('Éxito', 'Producto añadido a la tabla.', 'success');
            } else {
              Swal.fire('Aviso', 'El producto ya está en la tabla.', 'info');
            }
          } else {
            Swal.fire('No encontrado', 'Producto no encontrado en la API.', 'info');
          }
        },
        (error) => {
          console.error('Error al buscar el producto en la API:', error);
          Swal.fire('Error', 'No se pudo realizar la búsqueda. Intente nuevamente.', 'error');
        }
      );
    }
  
    this.searchCode = '';
  }
  searchProductsByCategory(): void {
    const categorySearchNormalized = this.searchCategory.trim().toLowerCase();
    
    if (!categorySearchNormalized) {
      Swal.fire('Aviso', 'Por favor ingrese una categoría para buscar.', 'warning');
      return;
    }
    
    // Realizar la consulta a la API para obtener los productos que coinciden con la categoría buscada
    this.http.get<Product[]>(apiUrl, {withCredentials: true}).subscribe(
      (products) => {
        // Filtrar productos que contienen la categoría buscada
        const filteredProducts = products.filter((product) => {
          const categories = this.getCategoryProducts(product);
          return categories.some((category) =>
            category.name.toLowerCase().includes(categorySearchNormalized)
          );
        });
        
        let addedProductsCount = 0;
  
        // Filtrar solo los productos que no están ya en la tabla
        filteredProducts.forEach((product) => {
          if (!this.productIdsInTable.has(product.id)) {
            this.addRowToTable(product);  // Agregar solo los productos nuevos
            addedProductsCount++; // Incrementar el contador de productos añadidos
          }
        });
  
        if (addedProductsCount > 0) {
          Swal.fire('Éxito', `Se añadió ${addedProductsCount} producto(s) a la tabla.`, 'success');
        } else {
          Swal.fire('Aviso', 'Todos los productos ya están en la tabla.', 'info');
        }
        
      },
      (error) => {
        console.error('Error al buscar productos por categoría:', error);
        Swal.fire('Error', 'Hubo un problema al buscar productos por categoría.', 'error');
      }
    );
    
    // Limpiar el campo de búsqueda
    this.searchCategory = '';
  }
  
  
toggleCategorySearch(): void {
  this.showCategorySearch = !this.showCategorySearch;
}


}
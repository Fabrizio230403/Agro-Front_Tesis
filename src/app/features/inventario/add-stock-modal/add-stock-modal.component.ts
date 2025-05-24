  import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Importar HttpParams
import Swal from 'sweetalert2';

interface KardexProductSummary {
  productId: number;
  productName: string;
  productCode: string;
  totalQuantityEntrada: number; // El JSON muestra números, así que number está bien
  totalQuantitySalidaPositiva: number;
  stockActualEnTablaProduct: number; // Esto es p.amount
  valorTotalEntradas: number;
  valorTotalSalidas: number;
  valorStockActualCalculadoTablaProduct: number; // Esto es ABS(p.amount * p.price)
  fechaUltimoMovimiento: string; // El JSON lo muestra como string "YYYY-MM-DD HH:MM:SS.F"
  // Puedes añadir aquí el resultado de getStockActualEnTablaProductAsBigDecimal() si lo expones
  // stockActualEnTablaProductAsBigDecimal: number;
}

@Component({
  selector: 'app-add-stock-modal',
  templateUrl: './add-stock-modal.component.html',
  styleUrl: './add-stock-modal.component.css'
})
export class AddStockModalComponent implements OnInit {
  @Input() productSelectedForStock: KardexProductSummary | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() stockAddedEvent = new EventEmitter<{ productName: string; addedQuantity: number; /* otros datos? */ }>();

  // Propiedades del formulario del modal
  quantity: number = 1; // Cantidad a añadir
  // unitCost: number | null = null; // Si tuvieras un campo para el costo unitario en el modal

  // Definir la URL base de tu API
  private apiUrlBase = 'http://localhost:8091'; // Ajusta según tu configuración de proxy o URL completa

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (this.productSelectedForStock) {
      console.log('Modal de añadir stock para:', this.productSelectedForStock.productName);
      // Si necesitaras un valor por defecto para unitCost, podrías inicializarlo aquí
      // this.unitCost = this.productToAddStock.currentPurchasePrice || 0;
    }
  }

  onClose(): void {
    this.closeModalEvent.emit();
  }

  onSaveStock(): void {
    if (!this.productSelectedForStock) {
      Swal.fire('Error', 'No se ha seleccionado un producto.', 'error');
      return;
    }
    if (this.quantity === null || this.quantity <= 0) {
      Swal.fire('Error', 'La cantidad a añadir debe ser mayor que cero.', 'error');
      return;
    }
    // Si tuvieras validación para unitCost:
    // if (this.unitCost === null || this.unitCost < 0) {
    //   Swal.fire('Error', 'El costo unitario no es válido.', 'error');
    //   return;
    // }

    // Construir la URL. El {id} se reemplaza por productToAddStock.productId
    const url = `${this.apiUrlBase}/addStock/${this.productSelectedForStock.productId}`;

    // Crear los parámetros de la solicitud
    // Esto añadirá "?quantity=X" a la URL
    let params = new HttpParams().set('quantity', this.quantity.toString());

    // Si en el futuro tu backend también acepta unitCost como @RequestParam:
    // if (this.unitCost !== null) {
    //   params = params.set('unitCost', this.unitCost.toString());
    // }

    console.log(`Enviando POST a: ${url} con params:`, params.toString());

    // Realizar la solicitud POST.
    // Como el backend espera la cantidad como @RequestParam, no se envía cuerpo (se pasa null).
    // El backend retorna un String, por lo que esperamos 'text'.
    this.http.post(url, null, { params: params, responseType: 'text', withCredentials: true })
      .subscribe(
        (responseMessage: string) => {
          console.log('Respuesta del servidor:', responseMessage);
          Swal.fire('Éxito', responseMessage, 'success');
          // Emitir evento para notificar al componente padre que el stock fue añadido
          this.stockAddedEvent.emit({
            productName: this.productSelectedForStock!.productName, // ! para asegurar que no es null aquí
            addedQuantity: this.quantity
            // unitCost: this.unitCost, // si lo enviaste
          });
          // this.onClose(); // Opcionalmente cierra el modal automáticamente
        },
        (error) => {
          console.error("Error al añadir stock:", error);
          const errorMessage = error.error?.message || error.message || 'No se pudo añadir el stock. Intente más tarde.';
          Swal.fire('Error', errorMessage, 'error');
        }
      );
  }
}

 import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';

interface KardexSummaryForModal { // Puede ser una versión simplificada si solo necesitas algunos campos
  productId: number;
  productCode: string;
  productName: string;
  // ... otros campos que necesites mostrar en el título del modal
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
  selector: 'app-historial-movimientos-modal',
  templateUrl: './historial-movimientos-modal.component.html',
  styleUrl: './historial-movimientos-modal.component.css'
})
export class HistorialMovimientosModalComponent implements OnInit, OnChanges {

  // @Input() para recibir datos del componente padre (InventarioComponent)
  @Input() selectedProductForHistory: KardexSummaryForModal | null = null;
  @Input() productMovements: ProductMovement[] = [];
  @Input() loadingMovements: boolean = false;

  // @Output() para notificar al componente padre que el modal debe cerrarse
  @Output() closeModalEvent = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    // Puedes poner lógica inicial aquí si es necesario cuando el componente se crea
    // console.log('Modal de historial inicializado con producto:', this.selectedProductForHistory);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Este hook se dispara cuando cambian los valores de los @Input()
    // Útil para depurar o reaccionar a cambios de datos
    if (changes['selectedProductForHistory']) {
      // console.log('Producto seleccionado ha cambiado:', this.selectedProductForHistory);
    }
    if (changes['productMovements']) {
      // console.log('Movimientos del producto han cambiado:', this.productMovements);
    }
    if (changes['loadingMovements']) {
      // console.log('Estado de carga ha cambiado:', this.loadingMovements);
    }
  }

  // Método para emitir el evento de cierre
  onCloseModal(): void {
    this.closeModalEvent.emit();
  }
}

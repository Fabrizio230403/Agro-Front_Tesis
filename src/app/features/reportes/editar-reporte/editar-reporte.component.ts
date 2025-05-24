import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportesService } from '../../../services/reportes.service';


@Component({
  selector: 'app-editar-reporte',
  templateUrl: './editar-reporte.component.html',
  styleUrls: ['./editar-reporte.component.css']
})

export class EditarReporteComponent {
  // Datos actuales del reporte para editar
  @Input() report: any = {
    name: '',
    type: '',
    date: '',
    address: '',
    permission: '',
    status: '',
    category: '',
    description: '',
    subTotal: 0,
    igv: 0,
    total: 0
  };

  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<any>();
  isTipoReporteModalOpen: boolean = false;
  selectedReportType: string = '';
  tableData: any[] = [];

  constructor(private reportesService: ReportesService) { }

  
  ngOnInit() {
    this.selectedReportType = this.report.type;
    this.loadReportData(this.report.type.toLowerCase());
  }
  

  // Manejar la selección del tipo de reporte
  handleReportTypeSelection(type: string) {
    this.selectedReportType = type;
    this.report.type = type;

    // Actualizar la categoría según el tipo de reporte
    if (type.toLowerCase() === 'ventas') {
      this.report.category = 'Ventas';
    } else if (type.toLowerCase() === 'finanzas') {
      this.report.category = 'Finanzas';
    }

    // Vaciar la tabla y cargar los datos correspondientes al tipo de reporte
    this.tableData = [];
    this.loadReportData(type.toLowerCase());
  }

  openTipoReporteModal() { this.isTipoReporteModalOpen = true; }

  closeTipoReporteModal() { this.isTipoReporteModalOpen = false; }

  
   // Cargar los datos según el tipo de reporte
   loadReportData(reportType: string) {
    const type = reportType.toLowerCase();
    if (type === 'ventas') {
      this.reportesService.getReporteVentas('05-2025').subscribe({
        next: (data: any) => {
          const ventas: any[] = data.ventasDelMes || [];
          this.tableData = ventas;

          const total = ventas.reduce((sum, venta) => sum + venta.total, 0);
          const subtotal = ventas.reduce((sum, venta) => sum + venta.subTotal, 0);
          const igv = ventas.reduce((sum, venta) => sum + venta.igv, 0);

          this.report.total = total;
          this.report.subTotal = subtotal;
          this.report.igv = igv;
        },
        error: (err) => {
          console.error("Error al generar reporte de ventas:", err);
          alert("Error al obtener las ventas del mes.");
        }
      });
    } else if (type === 'finanzas') {
      this.reportesService.getReporteFinanzas('12-2024').subscribe({
        next: (data: any) => {
          const finanzas: any[] = data.finanzasDelMes || [];
          this.tableData = finanzas;

          const total = finanzas.reduce((sum, finanza) => sum + finanza.total, 0);
          const subtotal = finanzas.reduce((sum, finanza) => sum + finanza.subTotal, 0);
          const igv = finanzas.reduce((sum, finanza) => sum + finanza.igv, 0);

          this.report.total = total;
          this.report.subTotal = subtotal;
          this.report.igv = igv;
        },
        error: (err) => {
          console.error("Error al generar reporte de finanzas:", err);
          alert("Error al obtener las finanzas del mes.");
        }
      });
    }
  }
  
  // Actualizar reporte
  updateReport() {
    if (!this.report.name || !this.report.type || !this.report.date) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Emitir el evento con los datos actualizados
    this.onUpdate.emit(this.report);
    this.closeModal();
  }

  // Cerrar el modal
  closeModal() {
    this.onClose.emit();
  }
}

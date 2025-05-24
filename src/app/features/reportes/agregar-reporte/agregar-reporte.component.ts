import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReportesService } from '../../../services/reportes.service';


@Component({
  selector: 'app-agregar-reporte',
  templateUrl: './agregar-reporte.component.html',
  styleUrls: ['./agregar-reporte.component.css']
})
export class AgregarReporteComponent {
  report = {
    name: '',
    type: '',
    date: '',
    address: '',
    permission: '',
    status: '',
    category: '',
    description: '',
    total: 0,
    subTotal: 0,
    igv: 0,
    totalFacturas: 0,
    totalBoletas: 0
  };

  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();
  isTipoReporteModalOpen: boolean = false;
  selectedReportType: string = '';
  tableData: any[] = [];

  constructor(private http: HttpClient, private reportesService: ReportesService) { }

  ngOnInit() {
    const today = new Date();
    this.report.date = today.toISOString().split('T')[0];
  }

  // Recibe el tipo de reporte seleccionado desde el componente TipoReporteComponent
  @Input() set reportType(type: string) {
    this.selectedReportType = type;
    this.report.type = type;
    this.tableData = [];
    this.loadReportData(type);
  }

  activeTab: 'facturas' | 'boletas' | 'resumen' = 'facturas';


  openTipoReporteModal() { this.isTipoReporteModalOpen = true; }

  closeTipoReporteModal() { this.isTipoReporteModalOpen = false; }

  // Manejar selección del tipo de reporte
  handleReportTypeSelection(selectedType: string) {
    this.selectedReportType = selectedType;
    this.report.type = selectedType;

    if (selectedType.toLowerCase() === 'ventas') {
      this.report.category = 'Ventas';
    } else if (selectedType.toLowerCase() === 'finanzas') {
      this.report.category = 'Finanzas';
    } else {
      this.report.category = '';
    }

    this.loadReportData(selectedType);
  }

  // Cargar datos según el tipo de reporte
  loadReportData(reportType: string) {
    const type = reportType.toLowerCase();
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, '0');  
    const anio = now.getFullYear();
    const periodo = `${mes}-${anio}`;

    if (type === 'ventas') {
      this.reportesService.getReporteVentas(periodo).subscribe({
        next: (data: any) => {
          const ventas: any[] = data.ventasDelMes || [];
          console.log("Datos de ventas:", ventas);

          this.tableData = ventas;

          // Subtotal solo para facturas (base para IGV)
          const subtotalFacturas = ventas.reduce((sum, venta) =>
            venta.documentType === 'FACTURA' ? sum + (venta.subTotal || 0) : sum, 0);

          // IGV calculado sobre el subtotal de facturas
          const igv = subtotalFacturas * 0.18;

          // Total solo de facturas
          const totalFacturas = ventas.reduce((sum, venta) =>
            venta.documentType === 'FACTURA' ? sum + (venta.total || 0) : sum, 0);

          // Total solo de boletas
          const totalBoletas = ventas.reduce((sum, venta) =>
            venta.documentType === 'BOLETA' ? sum + (venta.total || 0) : sum, 0);

          // Total general (facturas + boletas)
          const totalGeneral = totalFacturas + totalBoletas;

          this.report.subTotal = parseFloat(subtotalFacturas.toFixed(2));
          this.report.igv = parseFloat(igv.toFixed(2));
          this.report.totalFacturas = parseFloat(totalFacturas.toFixed(2));
          this.report.totalBoletas = parseFloat(totalBoletas.toFixed(2));
          this.report.total = parseFloat(totalGeneral.toFixed(2));
        },
        error: (err) => {
          console.error("Error al generar reporte de ventas:", err);
          alert("Error al obtener las ventas del mes.");
        }
      });
    }

    // Si el tipo es "finanzas", puedes implementar lo siguiente:
    else if (type === 'finanzas') {
      this.reportesService.getReporteFinanzas(periodo).subscribe({
        next: (data: any) => {
          const finanzas: any[] = data.productosVendidos || [];
          console.log("Datos de finanzas:", finanzas);

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

  // Guardar reporte
  saveReport() {
    if (!this.report.name || !this.selectedReportType || !this.report.date) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Obtener reportes actuales del localStorage
    const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
    savedReports.push(this.report);

    // Guardar el nuevo array en localStorage
    localStorage.setItem('savedReports', JSON.stringify(savedReports));

    this.onSave.emit(this.report);
    this.closeModal();
  }

  closeModal() {
    this.onClose.emit();
  }
}

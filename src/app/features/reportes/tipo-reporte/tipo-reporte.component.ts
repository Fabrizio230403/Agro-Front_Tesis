import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tipo-reporte',
  templateUrl: './tipo-reporte.component.html',
  styleUrls: ['./tipo-reporte.component.css']
})
export class TipoReporteComponent {
  @Input() selectedReportType: string = '';
  @Input() tableData: any[] = []; // Recibe los datos de la tabla principal
  @Output() onClose = new EventEmitter<void>();
  @Output() onSelect = new EventEmitter<string>();

  date: string = '';

  // Solo los tipos de reporte "Finanzas" y "Venta"
  reportTypes = [
    { name: 'Finanzas' },
    { name: 'Ventas' }
  ];

  filteredData: any[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;

  filter = {
    startDate: '',
    endDate: '',
    documentType: '',
  };


  documentTypes: string[] = [];
  paymentMethods: string[] = [];

  ngOnChanges() {
    this.extractDropdownValues();
    const timeZone = 'America/Lima';

    const peruDateString = new Date().toLocaleString('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    // ¡CAMBIO CLAVE AQUÍ!
    // Asigna la fecha directamente al modelo del input 'Desde'
    this.filter.startDate = peruDateString;
  }

  extractDropdownValues() {
    const docSet = new Set<string>();
    const paySet = new Set<string>();

    for (const item of this.tableData) {
      if (item.documentType) docSet.add(item.documentType);
      if (item.paymentMethod) paySet.add(item.paymentMethod);
    }

    this.documentTypes = Array.from(docSet);
    this.paymentMethods = Array.from(paySet);
  }


  get paginatedData() {
    const filtered = this.applyFilters(this.tableData);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  get totalPages(): number {
    const filtered = this.applyFilters(this.tableData);
    return Math.ceil(filtered.length / this.itemsPerPage);
  }

  applyFilters(data: any[]): any[] {
    return data.filter(item => {
      const issueDate = new Date(item.issueDate);
      const start = this.filter.startDate ? new Date(this.filter.startDate) : null;
      const end = this.filter.endDate ? new Date(this.filter.endDate) : null;

      return (!start || issueDate >= start) &&
        (!end || issueDate <= end) &&
        (!this.filter.documentType || item.documentType === this.filter.documentType);
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Filtra los datos según el tipo seleccionado
  selectReportType(reportType: string) {
    this.selectedReportType = reportType;

    if (reportType === 'Ventas') {
      this.filteredData = this.tableData;
    } else if (reportType === 'Finanzas') {
      this.filteredData = []; // Asegurarse de que la tabla de ventas esté vacía
      console.log("Seleccionado 'Finanzas', pero no se ha cargado ningún dato aún.");

    }

    console.log("Datos filtrados:", this.filteredData);

    // Emitir tipo seleccionado inmediatamente
    this.onSelect.emit(reportType); // Emitir para cargar los datos
  }

  // Confirmar selección
  confirmSelection() {
    this.onSelect.emit(this.selectedReportType); // Envía solo el tipo de reporte seleccionado
    this.closeModal();
  }


  // Cerrar modal
  closeModal() {
    this.onClose.emit();
  }
}

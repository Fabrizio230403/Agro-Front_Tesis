import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../services/reportes.service'; // Asegúrate de que la ruta sea correcta
import Swal from 'sweetalert2'; // Asegúrate de importar SweetAlert2 en tu archivo


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  isSidebarVisible = true;
  isFilterModalOpen = false;

  // Filtros
  filterStatus: string = '';
  filterCategory: string = '';

  // Datos originales y filtrados
  reports: any[] = [];
  filteredReports: any[] = [];
  selectedReportType: string = 'ventas';
  stockFilterType: string = 'alto';


  // Gráfico de línea
  lineChartOptions: any = {
    series: [],
    chart: {
      type: 'line',
      height: 350
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    }
  };

  // Gráfico circular
  pieChartOptions: any = {
    series: [],
    chart: {
      type: 'pie',
      height: 250
    },
    labels: ['Ventas', 'Inventario', 'Clientes', 'Proveedores', 'Finanzas'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  // Gráfico "Suma Total de Ventas"
  radialBarChartOptions: any = {
    series: [],
    chart: {
      type: 'radialBar',
      height: 350
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' }
      }
    },
    labels: ['Ganancia del Mes']
  };

  constructor(private reportesService: ReportesService) { }

  ngOnInit(): void {
    this.loadLocalReports();
    this.loadReportes();
  }

  isFormValid(newReport: any): boolean {
    return newReport &&
      newReport.name &&
      newReport.type &&
      newReport.date &&
      newReport.address &&
      newReport.status &&
      newReport.category;
  }

  loadLocalReports() {
    const saved = localStorage.getItem('savedReports');
    console.log(saved);
    this.reports = saved ? JSON.parse(saved) : [];
    this.filteredReports = [...this.reports];
    this.applyFilters(this.selectedReportType);
  }


  loadReportes(): void {
    const fechaActual = new Date();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const fecha = `${anio}-${mes}`;

    this.reportesService.getReporteGraficos().subscribe((data) => {
      console.log(data);

      this.pieChartOptions.series = [
        Number(data.ventas) || 0,
        Number(data.inventario) || 0,
        Number(data.clientes) || 0,
        Number(data.proveedores) || 0,
        Number(data.finanzas) || 0
      ];

      this.lineChartOptions.series = [
        {
          name: 'Ventas por Mes',
          data: data.ventasPorMes || []
        }
      ];

      this.radialBarChartOptions.series = [
        Number(data.gan1Month) || 0
      ];
    });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }


  openFilterModal() {
    this.isFilterModalOpen = true;
  }


  closeFilterModal() {
    this.isFilterModalOpen = false;
  }


  applyFilters(reportType: string) {
    this.selectedReportType = reportType;
    this.filteredReports = this.reports.filter((report) => {
      return report.type.toLowerCase() === this.selectedReportType.toLowerCase();
    });
    this.closeFilterModal();
  }

  isAddReportModalOpen = false;

  openAddReportModal() {
    this.isAddReportModalOpen = true;
  }

  closeAddReportModal() {
    this.isAddReportModalOpen = false;
  }

  addReportToTable(newReport: any) {
    // Validar si el formulario de reporte es válido
    if (!this.isFormValid(newReport)) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    newReport.id = Date.now().toString(); // solo lo vuelve string sin comilla
    this.reports.push(newReport);
    localStorage.setItem('savedReports', JSON.stringify(this.reports));

    const tipoNormalizado = newReport.type.toLowerCase();
    this.selectedReportType = tipoNormalizado;
    this.applyFilters(this.selectedReportType);

    // Mostrar modal de éxito al guardar el reporte
    Swal.fire({
      title: 'Reporte agregado',
      text: `El reporte de tipo "${newReport.type}" ha sido guardado exitosamente.`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }


  isEditModalOpen = false;
  selectedReport: any = null;

  openEditModal(report: any) {
    this.selectedReport = { ...report };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedReport = null;
  }

  updateReport(updatedReport: any) {
    // Validar si el formulario es válido
    if (!this.isFormValid(updatedReport)) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const index = this.reports.findIndex((r) => r.id === updatedReport.id);

    if (index !== -1) {
      this.reports[index] = updatedReport;
      this.filteredReports = [...this.reports];
      this.applyFilters(this.selectedReportType);
      localStorage.setItem('savedReports', JSON.stringify(this.reports));

      Swal.fire({
        title: 'Reporte actualizado',
        text: `El reporte de tipo "${updatedReport.type}" se ha actualizado correctamente.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } else {
      console.error('Reporte no encontrado');
    }

    this.closeEditModal();
  }

  deleteReport(index: number) {
    const reportToDelete = this.filteredReports[index];
    const reportType = reportToDelete.type;


    Swal.fire({
      title: `¿Eliminar reporte de "${reportType}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const realIndex = this.reports.findIndex(r => r.id === reportToDelete.id);

        if (realIndex !== -1) {
          this.reports.splice(realIndex, 1);
          localStorage.setItem('savedReports', JSON.stringify(this.reports));
          this.applyFilters(this.selectedReportType); // actualizar vista filtrada

          Swal.fire({
            title: 'Eliminado',
            text: `El reporte de tipo "${reportType}" fue eliminado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo encontrar el reporte a eliminar.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }

  isExportModalOpen: boolean = false;

  openExportModal() {
    this.isExportModalOpen = true;
  }

  closeExportModal() {
    this.isExportModalOpen = false;
  }
}

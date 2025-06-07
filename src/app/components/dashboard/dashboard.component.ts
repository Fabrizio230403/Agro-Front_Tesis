import { Component, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { ReportesService } from '../../services/reportes.service';

// ... (Las nuevas interfaces van aquí, como se mostró arriba) ...

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  dataLabels?: ApexDataLabels;
  grid?: ApexGrid;
  labels?: string[];
  plotOptions?: ApexPlotOptions;
  legend?: ApexLegend;
  colors?: string[];
  responsive?: any;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  isSidebarVisible = true;
  charts: Partial<ChartOptions>[] = [];
  isLoading = true;

  // --- Propiedades para los info-cards (actualizadas) ---
  ingresoMes: number = 0;
  gastoMes: number = 0;
  diferenciaMes: number = 0;

  constructor(private dashboardApiService: ReportesService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardApiService.getReporteGraficosDashboardFinanzas().subscribe(
      (data: DashboardFinanzas) => { // <-- Tipo de dato actualizado
        this.processApiData(data); // <-- Llama al método nuevo
        this.isLoading = false;
        console.log('API Data Received and Processed:', data);
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
        this.isLoading = false;
        this.initDefaultCharts();
      }
    );
  }

  /**
   * Procesa los datos de la nueva API y configura los gráficos.
   * Este método está completamente reescrito.
   */
  processApiData(data: DashboardFinanzas): void {
  // 1. Poblar los info-cards
  this.ingresoMes = data.ingresoMes;
  this.gastoMes = data.gastoMes;
  this.diferenciaMes = data.diferenciaMes;

  // 2. Inicializar los gráficos de forma segura, filtrando nulos
  this.charts = [
    // Chart 0: Ingresos vs. Egresos
    {
      series: [
        // CORREGIDO: Añadimos .filter(item => item) para eliminar nulos del arreglo
        { name: "Ingresos", data: (data.ingresos6meses ?? []).filter(item => item).map(item => item.num) },
        { name: "Egresos", data: (data.egresos6meses ?? []).filter(item => item).map(item => item.num) }
      ],
      chart: { height: 220, type: "line", toolbar: { show: false }, zoom: { enabled: false } },
      colors: ['#00E396', '#FF4560'],
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: (data.ingresos6meses ?? []).filter(item => item).map(item => item.string),
        labels: { style: { colors: '#666', fontSize: '11px' } }
      },
      // ... el resto de las propiedades del gráfico 0
    },

    // Chart 1: Formas de Pago
    {
      series: (data.formasPago ?? []).filter(item => item).map(item => item.num),
      chart: { height: 200, type: "donut", toolbar: { show: false } },
      colors: ['#008FFB', '#FEB019', '#00E396', '#FF4560'],
      labels: (data.formasPago ?? []).filter(item => item).map(item => item.string),
      // ... el resto de las propiedades del gráfico 1
    },

    // Chart 2: Comprobantes Emitidos
    {
  series: [{
    name: 'Cantidad',
    data: (data.comprobantesEmitidos ?? []).filter(item => item).map(item => item.num)
  }],
  chart: {
    type: 'bar',
    height: 180,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '45%',
      distributed: true // Cada barra con su color
    }
  },
  colors: ['#3F51B5', '#00ACC1'],
  
  // ETIQUETAS DE DATOS (NÚMEROS DENTRO DE LAS BARRAS)
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toString(),
    textAnchor: 'start',
    offsetX: 10,
    style: {
      fontSize: '14px',
      colors: ['#fff'],
      fontWeight: 'bold'
    }
  },
  
  // EJE Y (ETIQUETAS DE TEXTO: "Factura", "Boleta")
  // Solo contiene la configuración de estilo para las etiquetas.
  yaxis: {
    labels: {
      show: true,
      style: {
        colors: '#6B7280',
        fontSize: '13px',
        fontWeight: 'bold'
      }
    }
  },
  
  // EJE X (EJE NUMÉRICO Y DATOS DE CATEGORÍA)
  xaxis: {
    // CORRECCIÓN: Las categorías que se muestran en el eje Y van aquí.
    categories: (data.comprobantesEmitidos ?? []).filter(item => item).map(item => item.string),
    
    // Estilos para las etiquetas del eje numérico (horizontal)
    labels: {
      show: true,
      style: {
        colors: '#666',
        fontSize: '11px'
      },
      // El formateador simple para los números del eje.
      formatter: (val: string) => {
        // El valor llega como string, lo convertimos a número para la comprobación.
        const numVal = parseFloat(val);
        if (numVal % 1 === 0) {
          return numVal.toFixed(0);
        }
        return '';
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  
  legend: { show: false },
  
  grid: {
    show: true,
    borderColor: '#e0e0e0',
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } }
  },
  
  tooltip: {
    enabled: true,
    y: {
      title: {
        formatter: (seriesName) => 'Cantidad:'
      }
    }
  }
},

    // Chart 3: Top 8 Categorías más vendidas
    {
  series: [{
    name: 'Total Vendido',
    data: (data.ventasCategoria ?? []).filter(item => item).map(item => item.num)
  }],
  chart: {
    type: 'bar', // Tipo de gráfico: barras
    height: 220,
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      horizontal: false, // Barras verticales
      columnWidth: '50%',
      dataLabels: {
        position: 'top' // Etiquetas de datos en la parte superior
      }
    }
  },
  colors: ['#4CAF50'], // Un color verde para las ventas
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(0), // Muestra el valor entero en la barra
    offsetY: -20, // Desplaza la etiqueta hacia arriba
    style: {
      fontSize: '11px',
      colors: ['#333']
    }
  },
  
  // Eje X: Contiene las categorías (nombres)
  xaxis: {
    categories: (data.ventasCategoria ?? []).filter(item => item).map(item => item.string),
    labels: {
      show: true,
      rotate: -45, // Rota las etiquetas para que quepan
      hideOverlappingLabels: true,
      trim: true,
      style: {
        colors: '#6B7280',
        fontSize: '11px'
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },

  // Eje Y: Es el eje numérico
  yaxis: {
    labels: {
      show: true,
      
      // --- CORRECCIÓN CLAVE AQUÍ ---
      // Formateador para mostrar solo números enteros en el eje Y
      formatter: (val: number) => {
        if (val % 1 === 0) {
          // Si es un entero, lo muestra sin decimales.
          return val.toFixed(0);
        }
        // Si no es un entero (ej. 1.5), no muestra la etiqueta.
        return '';
      },
      
      style: {
        colors: '#6B7280',
        fontSize: '11px'
      }
    }
  },
  
  legend: { show: false },
  
  grid: {
    show: true,
    borderColor: '#E5E7EB',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } }, // Líneas guía horizontales
    xaxis: { lines: { show: false } }
  },
  
  tooltip: {
    // El tooltip puede seguir mostrando los decimales para mayor precisión
    y: {
      formatter: (val: number) => val.toFixed(2)
    }
  }
}
  ];
}

  initDefaultCharts(): void {
    this.charts = [
      { series: [{ name: 'Ingresos', data: [] }, { name: 'Egresos', data: [] }], chart: { type: 'line', height: 220 }, xaxis: { categories: [] } },
      { series: [], chart: { type: 'donut', height: 200 }, labels: [] },
      { series: [], chart: { type: 'pie', height: 220 }, labels: [] },
      { series: [], chart: { type: 'bar', height: 220 }, plotOptions: { bar: { horizontal: true } }, yaxis: { labels: {formatter: () => ''} } },
    ];
  }
  
  // ... (El resto de los métodos como toggleSidebar y updateChartsSize no necesitan cambios) ...
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    // Se espera 350ms (la duración de la transición CSS) antes de redibujar los gráficos
    setTimeout(() => this.updateChartsSize(), 350);
  }

  private updateChartsSize() {
    // Esto dispara un evento global de 'resize' que ApexCharts escucha
    // para ajustarse al nuevo tamaño de su contenedor.
    window.dispatchEvent(new Event('resize'));
  }
}



export interface Fila {
  string: string; // En tu backend usas 'string', así que lo mantenemos
  num: number;    // En tu backend usas 'num'
}

export interface Fila {
  string: string;
  num: number;
}

export interface FilaPorcentaje {
  string: string;
  num: number; // En Java es double, en TS es number, está bien.
}

export interface DashboardFinanzas {
  ingresos6meses: FilaPorcentaje[];
  egresos6meses: FilaPorcentaje[];
  formasPago: FilaPorcentaje[];
  ingresoMes: number;
  gastoMes: number;
  diferenciaMes: number;
  comprobantesEmitidos: Fila[];
  ventasCategoria: Fila[];
}
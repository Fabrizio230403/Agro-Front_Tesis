import { Component, OnInit, ViewChild } from '@angular/core'; // Agrega ViewChild si vas a usarlo para actualizar charts
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
  // ApexFill, // No parece usarse activamente en tus configuraciones iniciales
  // ApexResponsive // No parece usarse activamente en tus configuraciones iniciales
  ChartComponent // Import ChartComponent para referenciar los charts
} from 'ng-apexcharts';
import { ReportesService } from '../../services/reportes.service';

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
  responsive?: any; // ApexResponsive[]; // Puedes ser más específico si es necesario
};


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Referencias a los charts si necesitas actualizarlos programáticamente después de la carga inicial
  @ViewChild("totalSalesChart") totalSalesChart: ChartComponent | undefined;
  @ViewChild("invoiceStatusChart") invoiceStatusChart: ChartComponent | undefined;
  @ViewChild("lowStockChart") lowStockChart: ChartComponent | undefined;
  @ViewChild("topProductsChart") topProductsChart: ChartComponent | undefined;


  isSidebarVisible = true;
  charts: Partial<ChartOptions>[] = []; // Usamos Partial para la inicialización
  isLoading = true; // Para mostrar un indicador de carga

  // Propiedades para los datos de los info-cards
  ventasDiaTotal: number = 0;
  ventasDiaCantidad: number = 0;
  entradaMonto: number = 0;
  entradaProducto: number = 0;
  salidaMonto: number = 0;
  salidaProducto: number = 0;


  constructor(private dashboardApiService: ReportesService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardApiService.getReporteGraficosDashboard().subscribe(
      (data: DashboardData) => {
        this.processApiData(data);
        this.isLoading = false;
        console.log('API Data Received and Processed:', data);
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
        this.isLoading = false;
        // Aquí podrías inicializar los charts con datos vacíos o de error
        this.initDefaultCharts(); // O alguna lógica de manejo de error
      }
    );
  }

  processApiData(data: DashboardData): void {
    // Poblar info-cards
    this.ventasDiaTotal = data.ventasDiaTotal;
    this.ventasDiaCantidad = data.ventasDiaCantidad;
    this.entradaMonto = data.entradaMonto;
    this.entradaProducto = data.entradaProducto;
    this.salidaMonto = data.salidaMonto;
    this.salidaProducto = data.salidaProducto;

    // Inicializar/Actualizar configuraciones de los charts
    this.charts = [
      // Chart 0: Total de ventas de los últimos 6 meses (Line Chart)
      {
        series: [
          {
            name: "Ventas",
            data: data.ventas6meses.map(item => item.num)
          }
        ],
        chart: { height: 220, type: "line", toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { curve: "smooth", width: 3, colors: ['#008FFB'] },
        xaxis: {
          categories: data.ventas6meses.map(item => item.string), // Nombres de los meses
          labels: { style: { colors: '#666', fontSize: '11px' } },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            style: { colors: '#666', fontSize: '11px' },
            formatter: (val: number) => "S/. " + val.toFixed(2)
          }
        },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (val: number) => "S/. " + val.toFixed(2) } },
        grid: { show: true, borderColor: '#e0e0e0', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } }, padding: { top: 5, right: 10, bottom: 0, left: 10 } }
      },

      // Chart 1: Estados de Facturas (Donut Chart)
      {
        series: data.estadoFactura.map(item => item.num),
        chart: { height: 200, type: "donut", toolbar: { show: false } },
        // Considera tener un mapeo de colores o dejar que ApexCharts elija si el número de estados varía
        colors: data.estadoFactura.length === 2 ? ['#00ACC1', '#F44336'] : ['#F44336', '#FF9800', '#00ACC1', '#CDDC39'], // Ajusta colores
        plotOptions: { pie: { donut: { size: '65%', labels: { show: true, value: { offsetY: 4, fontSize: '12px', fontWeight: 'bold' }, total: { show: false } } } } },
        dataLabels: { enabled: true, formatter: (val: number, opts: any) => {
            // Para mostrar el valor real en lugar del porcentaje en el donut
            const seriesIndex = opts.seriesIndex;
            return data.estadoFactura[seriesIndex].num.toString();
          }, style: { fontSize: '11px', fontWeight: 'bold' }, dropShadow: { enabled: false } },
        labels: data.estadoFactura.map(item => item.string),
        legend: { show: true, position: 'bottom' },
        tooltip: { enabled: true, y: { formatter: (val: number, { seriesIndex, w }) => {
            const label = w.config.labels[seriesIndex];
            return `${label}: ${val}`;
          } } }
      },

      // Chart 2: Productos con bajo stock (Vertical Bar Chart)
      {
        series: [
          {
            name: "Stock",
            data: data.bajoStock.map(item => item.num)
          }
        ],
        chart: { height: 310, type: "bar", toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: "55%", dataLabels: { position: 'top' } } },
        dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '11px', colors: ["#555"] } },
        colors: ['#A0AEC0'],
        xaxis: {
          categories: data.bajoStock.map(item => item.string),
          labels: { show: true, rotate: -45, rotateAlways: false, hideOverlappingLabels: true, trim: true, style: { colors: '#666', fontSize: '10px' }, offsetY: 5 },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: { labels: { show: true, style: { colors: '#666', fontSize: '11px' } } },
        grid: { show: true, borderColor: '#e0e0e0', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } }
      },

      // Chart 3: Productos mas vendidos del mes (Horizontal Bar Chart)
      {
        series: [{
            name: 'Ventas',
            data: data.masVendidos.map(item => item.num)
        }],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, barHeight: '60%', distributed: false, dataLabels: { position: 'top' } } }, // distributed: false si quieres un solo color para la serie
        colors: ['#2ECC71'], // Un solo color si distributed es false, o un array si es true y quieres colores por barra
        dataLabels: { enabled: true, formatter: (val: number) => val.toString(), textAnchor: 'middle', style: { fontSize: '11px', colors: ['#fff'] }, offsetX: 0 },
        xaxis: {
             categories: data.masVendidos.map(item => item.num), // O podrías no necesitar categories aquí si el eje es numérico
             labels: { show: true, style: { colors: '#666', fontSize: '11px' } },
             axisBorder: { show: false },
        },
        yaxis: {
          labels: {
            show: true,
            style: { colors: '#666', fontSize: '11px' },
            formatter: (valueFromApex: any, optsFromApex: any): string => { // ASUMIENDO QUE EL 2DO PARÁMETRO ES OPTS
              console.log('Y-AXIS FORMATTER - Value:', valueFromApex, 'Opts:', optsFromApex); // Log principal
          
              const dataPointIndex = optsFromApex?.dataPointIndex; // Intenta obtener el dataPointIndex
          
              console.log('DataPointIndex extracted:', dataPointIndex); // Log específico para el índice
          
              if (typeof dataPointIndex === 'number' &&
                  data.masVendidos &&
                  dataPointIndex >= 0 &&
                  dataPointIndex < data.masVendidos.length &&
                  data.masVendidos[dataPointIndex]) {
                  console.log('SUCCESS: Returning:', data.masVendidos[dataPointIndex].string);
                  return data.masVendidos[dataPointIndex].string; // Devuelve UN SOLO string
              }
          
              // Fallback si no se pudo obtener el índice correcto
              console.warn('WARN: Could not determine correct label for value:', valueFromApex, 'opts:', optsFromApex);
              // Devuelve algo para indicar el fallo, pero que sea un solo string
              return `Index? ${dataPointIndex ?? 'N/A'}`;
          },
        },
        },
        legend: { show: false },
        grid: { show: true, borderColor: '#e0e0e0', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
        tooltip: { // Asegúrate de que el tooltip muestre el nombre del producto
          enabled: true,
          y: {
              formatter: (val: number, { seriesIndex, dataPointIndex, w }) => {
                  if (data.masVendidos && data.masVendidos[dataPointIndex]) {
                      const categoryName = data.masVendidos[dataPointIndex].string;
                      return `Cantidad: ${val.toFixed(0)}`; // Muestra "Producto A: 39"
                  }
                  return `${val.toFixed(0)}`;
              },
              title: {
                  formatter: (seriesName: string) => '' // Oculta "Ventas:"
              }
          }
      }
      }
    ];
  }

  initDefaultCharts(): void {
    // Aquí puedes poner la lógica de tus charts estáticos si la API falla
    // O simplemente dejar los charts vacíos o con un mensaje de error
    console.log("Initializing with default/empty chart data due to API error.");
    this.charts = [
      { series: [], chart: { type: 'line', height: 220 }, xaxis: { categories: [] } },
      { series: [], chart: { type: 'donut', height: 200 }, labels: [] },
      { series: [], chart: { type: 'bar', height: 310 }, xaxis: { categories: [] } },
      { series: [], chart: { type: 'bar', height: 180 }, plotOptions: { bar: { horizontal: true } }, yaxis: { labels: {formatter: () => ''} } },
    ];
  }


  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    setTimeout(() => this.updateChartsSize(), 350);
  }

  private updateChartsSize() {
    window.dispatchEvent(new Event('resize'));
  }
}

export interface Fila {
  string: string; // En tu backend usas 'string', así que lo mantenemos
  num: number;    // En tu backend usas 'num'
}

export interface DashboardData {
  ventas6meses: Fila[];
  ventasDiaTotal: number;
  ventasDiaCantidad: number;
  estadoFactura: Fila[];
  entradaMonto: number;
  entradaProducto: number;
  salidaMonto: number;
  salidaProducto: number;
  bajoStock: Fila[];
  masVendidos: Fila[];
}
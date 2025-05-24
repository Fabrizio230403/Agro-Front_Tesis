import { Component, EventEmitter, Input, Output } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, parseISO } from 'date-fns';


@Component({
  selector: 'app-exportar-reporte',
  templateUrl: './exportar-reporte.component.html',
  styleUrls: ['./exportar-reporte.component.css']
})
export class ExportarReporteComponent {
  @Input() tableData: any[] = [];  
  @Input() reportType: string = '';  
  @Output() onClose = new EventEmitter<void>();
 
    ngOnInit() {
      console.log('Datos recibidos:', this.tableData);
      console.log('Tipo de reporte:', this.reportType);

    }

      exportToPDF() {
        if (this.tableData.length === 0) {
          alert('No hay datos para exportar.');
          return;
        }
      
        const doc = new jsPDF('landscape');
        let title = '';
        let head: string[][] = [];
        let body: any[][] = [];
        let columnStyles: any = {};
      
        switch (this.reportType) {
          case 'ventas':
            title = 'Reporte de Ventas';
            head = [['Nombre', 'Descripción', 'Categoría', 'Estado', 'Dirección', 'Fecha de Registro','Subtotal', 'IGV', 'Total']];
            
            body = this.tableData.map(item => {
              const formattedDate = item.date ? format(parseISO(item.date), 'dd/MM/yyyy') : 'N/A';
              return [
                item.name || 'N/A',
                item.description || 'N/A',
                item.category || 'N/A',
                item.status || 'N/A',
                item.address || 'N/A',
                formattedDate, 
                item.subTotal != null ? `S/. ${item.subTotal}` : 'N/A',
                item.igv != null ? `S/. ${item.igv}` : 'N/A',
                item.total != null ? `S/. ${item.total}` : 'N/A',
              ];
            });
            
            columnStyles = {
              0: { cellWidth: 30 },
              1: { cellWidth: 30 },
              2: { cellWidth: 25 },
              3: { cellWidth: 25 },
              4: { cellWidth: 30 },
              5: { cellWidth: 25 },
              6: { cellWidth: 25 },
              7: { cellWidth: 25 },
              8: { cellWidth: 25 },
            };
            break;
      
            case 'finanzas':
              title = 'Reporte de Finanzas';
              head = [['Nombre', 'Descripción', 'Categoría', 'Estado', 'Dirección', 'Fecha de Registro','Subtotal', 'IGV', 'Total']];
              
              body = this.tableData.map(item => {
                const formattedDate = item.date ? format(parseISO(item.date), 'dd/MM/yyyy') : 'N/A';
                return [
                  item.name || 'N/A',
                  item.description || 'N/A',
                  item.category || 'N/A',
                  item.status || 'N/A',
                  item.address || 'N/A',
                  formattedDate,  
                  item.subTotal != null ? `S/. ${item.subTotal}` : 'N/A',
                  item.igv != null ? `S/. ${item.igv}` : 'N/A',
                  item.total != null ? `S/. ${item.total}` : 'N/A',
                ];
              });
            
              columnStyles = {
                0: { cellWidth: 30 },
                1: { cellWidth: 30 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 },
                7: { cellWidth: 25 },
                8: { cellWidth: 25 },
              };
              break;
      
          default:
            alert('Tipo de reporte no soportado.');
            return;
        }
      
        doc.text(title, 10, 10);
        (doc as any).autoTable({
          head,
          body,
          startY: 20,
          styles: {
            fontSize: 8,  
          },
          columnStyles
        });
      
        doc.save(`reporte-${this.reportType}.pdf`);
        this.closeModal();
      }


  // Exportar a Excel
  exportToExcel() {

    const tableDataWithoutId = this.tableData.map(({ id, ...rest }) => rest);  
  
    const head = [['Nombre', 'Descripción', 'Categoría', 'Estado', 'Dirección', 'Fecha de Registro', 'Subtotal', 'IGV', 'Total']];
    
    const formattedData = tableDataWithoutId.map(report => [
      report.name, 
      report.description, 
      report.category, 
      report.status, 
      report.address, 
      report.date, 
      report.subTotal, 
      report.igv, 
      report.total
    ]);
    
    const finalData = [...head, ...formattedData];
  
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reportes.xlsx');
  
    this.closeModal();
  }

  closeModal() {
    this.onClose.emit();
  }

  
}

/*exportToExcel() {
  // Paso 1: Eliminar el campo 'id' de los datos
  const tableDataWithoutId = this.tableData.map(({ id, ...rest }) => rest); // Elimina el campo 'id'

  // Paso 2: Crear la hoja con los datos sin el ID
  const worksheet = XLSX.utils.json_to_sheet(tableDataWithoutId);

  // Paso 3: Crear y exportar archivo
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes');
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, 'reportes.xlsx');

  this.closeModal();
}*/

 
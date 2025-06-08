import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Cliente } from '../../../models/client.model';

@Component({
  selector: 'app-cliente-detalle',
  templateUrl: './cliente-detalle.component.html',
  styleUrls: ['./cliente-detalle.component.css']
})
export class ClienteDetalleComponent {

  @Input() cliente: Cliente | null = null;

  @Output() close = new EventEmitter<void>();


  constructor() {}

  closeModal(): void {
    this.close.emit();
  }
}

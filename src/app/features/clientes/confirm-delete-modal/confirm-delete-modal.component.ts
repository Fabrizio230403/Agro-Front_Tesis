import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-modal',
  templateUrl: './confirm-delete-modal.component.html',
  styleUrls: ['./confirm-delete-modal.component.css']
})
export class ConfirmDeleteModalComponent {
  isDeleted = false;

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteModalComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false); 
  }

  onConfirm(): void {
    this.isDeleted = true; 
   }

  onClose(): void {
    this.dialogRef.close(true); 
  }
}

 
 

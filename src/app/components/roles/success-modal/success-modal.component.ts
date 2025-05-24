import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-success-modal',
    templateUrl: './success-modal.component.html',
})
export class SuccessModalComponent {
    @Input() title: string = ''; 
    @Input() placeholder: string = ''; 
    @Input() isOpen: boolean = false; 
    @Output() onClose = new EventEmitter<void>(); 
    @Output() onSave = new EventEmitter<string>(); 
  
    inputValue: string = '';
    closeModal() {
      this.onClose.emit();
    }
  
    saveModal() {
      this.onSave.emit(this.inputValue);
      this.inputValue = ''; 
    }
  }
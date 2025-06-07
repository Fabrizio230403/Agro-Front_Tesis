// src/app/shared/components/custom-paginator/custom-paginator.component.ts

import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-paginator.component.html',
  styleUrls: ['./custom-paginator.component.css']
})
export class CustomPaginatorComponent implements OnChanges {

  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  
  // ----- LA CORRECCIÓN ESTÁ AQUÍ -----
  @Input() itemsPerPage: number = 10; 
  // ------------------------------------

  @Input() pageRangeDisplayed: number = 2;

  @Output() pageChange = new EventEmitter<number>();

  totalPages: number = 0;
  pageNumbers: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalItems'] || changes['itemsPerPage']) {
      this.calculatePagination();
    }
  }
  
  // ... el resto del archivo .ts permanece igual ...

  private calculatePagination(): void {
    if (!this.totalItems || this.totalItems <= 0) {
      this.totalPages = 0;
      this.pageNumbers = [];
      return;
    }

    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pageNumbers = this.generatePageNumbers();
  }

  private generatePageNumbers(): (number | string)[] {
    const pageNumbers: (number | string)[] = [];
    const totalPageNumbersToShow = (this.pageRangeDisplayed * 2) + 1 + 2 + 2;

    if (this.totalPages <= totalPageNumbersToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    pageNumbers.push(1);
    let startPage = Math.max(2, this.currentPage - this.pageRangeDisplayed);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + this.pageRangeDisplayed);

    if (this.currentPage - this.pageRangeDisplayed > 2) {
      pageNumbers.push('...');
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (this.currentPage + this.pageRangeDisplayed < this.totalPages - 1) {
      pageNumbers.push('...');
    }
    pageNumbers.push(this.totalPages);

    return pageNumbers;
  }

  changePage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ver-ges',
  templateUrl: './ver-ges.component.html',
  styleUrls: ['./ver-ges.component.css']
})
export class VerGesComponent {
  visible: boolean = false;
  pdfUrl: SafeResourceUrl = '';

  constructor(private sanitizer: DomSanitizer) {}

  abrirModal(url: string) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.visible = true;
  }

  cerrarModal() {
    this.visible = false;
    this.pdfUrl = '';
  }
}
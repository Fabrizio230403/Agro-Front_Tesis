import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportarReporteComponent } from './exportar-reporte.component';

describe('ExportarReporteComponent', () => {
  let component: ExportarReporteComponent;
  let fixture: ComponentFixture<ExportarReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportarReporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportarReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

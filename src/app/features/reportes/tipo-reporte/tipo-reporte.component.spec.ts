import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoReporteComponent } from './tipo-reporte.component';

describe('TipoReporteComponent', () => {
  let component: TipoReporteComponent;
  let fixture: ComponentFixture<TipoReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TipoReporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

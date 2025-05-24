import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarReporteComponent } from './editar-reporte.component';

describe('EditarReporteComponent', () => {
  let component: EditarReporteComponent;
  let fixture: ComponentFixture<EditarReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarReporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

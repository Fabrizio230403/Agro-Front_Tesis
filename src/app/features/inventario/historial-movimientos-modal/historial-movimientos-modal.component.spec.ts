import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialMovimientosModalComponent } from './historial-movimientos-modal.component';

describe('HistorialMovimientosModalComponent', () => {
  let component: HistorialMovimientosModalComponent;
  let fixture: ComponentFixture<HistorialMovimientosModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistorialMovimientosModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialMovimientosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrarModalComponent } from './filtrar-modal.component';

describe('FiltrarModalComponent', () => {
  let component: FiltrarModalComponent;
  let fixture: ComponentFixture<FiltrarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltrarModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

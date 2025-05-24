import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargarGesComponent } from './descargar-ges.component';

describe('DescargarGesComponent', () => {
  let component: DescargarGesComponent;
  let fixture: ComponentFixture<DescargarGesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DescargarGesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescargarGesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarGesComponent } from './eliminar-ges.component';

describe('EliminarGesComponent', () => {
  let component: EliminarGesComponent;
  let fixture: ComponentFixture<EliminarGesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EliminarGesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarGesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

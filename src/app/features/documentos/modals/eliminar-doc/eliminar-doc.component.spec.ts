import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarDocComponent } from './eliminar-doc.component';

describe('EliminarDocComponent', () => {
  let component: EliminarDocComponent;
  let fixture: ComponentFixture<EliminarDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EliminarDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

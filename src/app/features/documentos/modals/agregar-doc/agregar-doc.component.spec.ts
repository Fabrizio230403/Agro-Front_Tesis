import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarDocComponent } from './agregar-doc.component';

describe('AgregarDocComponent', () => {
  let component: AgregarDocComponent;
  let fixture: ComponentFixture<AgregarDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

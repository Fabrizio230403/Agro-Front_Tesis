import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarModalComponent } from './agregar-modal.component';

describe('AgregarModalComponent', () => {
  let component: AgregarModalComponent;
  let fixture: ComponentFixture<AgregarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

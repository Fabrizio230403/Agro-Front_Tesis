import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStockModalComponent } from './add-stock-modal.component';

describe('AddStockModalComponent', () => {
  let component: AddStockModalComponent;
  let fixture: ComponentFixture<AddStockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddStockModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

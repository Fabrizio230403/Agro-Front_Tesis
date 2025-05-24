import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPermissionsModalComponent } from './edit-permissions-modal.component';

describe('EditPermissionsModalComponent', () => {
  let component: EditPermissionsModalComponent;
  let fixture: ComponentFixture<EditPermissionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPermissionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPermissionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

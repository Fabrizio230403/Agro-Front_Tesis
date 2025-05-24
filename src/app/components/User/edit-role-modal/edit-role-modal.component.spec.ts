import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoleModalComponent } from './edit-role-modal.component';

describe('EditRoleModalComponent', () => {
  let component: EditRoleModalComponent;
  let fixture: ComponentFixture<EditRoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditRoleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

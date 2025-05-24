import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerGesComponent } from './ver-ges.component';

describe('VerGesComponent', () => {
  let component: VerGesComponent;
  let fixture: ComponentFixture<VerGesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerGesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerGesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

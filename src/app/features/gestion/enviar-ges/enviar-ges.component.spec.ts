import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnviarGesComponent } from './enviar-ges.component';

describe('EnviarGesComponent', () => {
  let component: EnviarGesComponent;
  let fixture: ComponentFixture<EnviarGesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnviarGesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnviarGesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

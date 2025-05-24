import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnviarDocComponent } from './enviar-doc.component';

describe('EnviarDocComponent', () => {
  let component: EnviarDocComponent;
  let fixture: ComponentFixture<EnviarDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnviarDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnviarDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

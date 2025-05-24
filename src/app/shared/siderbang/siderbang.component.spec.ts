import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiderbangComponent } from './siderbang.component';

describe('SiderbangComponent', () => {
  let component: SiderbangComponent;
  let fixture: ComponentFixture<SiderbangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiderbangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderbangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

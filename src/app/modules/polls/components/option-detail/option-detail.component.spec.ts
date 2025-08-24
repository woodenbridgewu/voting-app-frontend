import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionDetailComponent } from './option-detail.component';

describe('OptionDetailComponent', () => {
  let component: OptionDetailComponent;
  let fixture: ComponentFixture<OptionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OptionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

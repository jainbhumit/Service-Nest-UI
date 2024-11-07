import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseholderRequestComponent } from './householder-request.component';

describe('HouseholderRequestComponent', () => {
  let component: HouseholderRequestComponent;
  let fixture: ComponentFixture<HouseholderRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HouseholderRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HouseholderRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

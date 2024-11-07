import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptedRequestComponent } from './accepted-request.component';

describe('AcceptedRequestComponent', () => {
  let component: AcceptedRequestComponent;
  let fixture: ComponentFixture<AcceptedRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AcceptedRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AcceptedRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

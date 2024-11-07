import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCancelRequestComponentComponent } from './confirm-cancel-request-component.component';

describe('ConfirmCancelRequestComponentComponent', () => {
  let component: ConfirmCancelRequestComponentComponent;
  let fixture: ComponentFixture<ConfirmCancelRequestComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmCancelRequestComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmCancelRequestComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

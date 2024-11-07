import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestServiceFormComponent } from './request-service-form.component';

describe('RequestServiceFormComponent', () => {
  let component: RequestServiceFormComponent;
  let fixture: ComponentFixture<RequestServiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestServiceFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestServiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

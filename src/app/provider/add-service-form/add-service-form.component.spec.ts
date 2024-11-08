import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServiceFormComponent } from './add-service-form.component';

describe('AddServiceFormComponent', () => {
  let component: AddServiceFormComponent;
  let fixture: ComponentFixture<AddServiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddServiceFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddServiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

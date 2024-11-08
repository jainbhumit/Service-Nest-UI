import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCategoryComponent } from './request-category.component';

describe('RequestCategoryComponent', () => {
  let component: RequestCategoryComponent;
  let fixture: ComponentFixture<RequestCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

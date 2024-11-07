import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseholderCategoryComponent } from './householder-category.component';

describe('HouseholderCategoryComponent', () => {
  let component: HouseholderCategoryComponent;
  let fixture: ComponentFixture<HouseholderCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HouseholderCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HouseholderCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

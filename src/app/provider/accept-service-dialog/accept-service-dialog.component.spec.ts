import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptServiceDialogComponent } from './accept-service-dialog.component';

describe('AcceptServiceDialogComponent', () => {
  let component: AcceptServiceDialogComponent;
  let fixture: ComponentFixture<AcceptServiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AcceptServiceDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AcceptServiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

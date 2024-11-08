import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderApproveRequestComponent } from './provider-approve-request.component';

describe('ProviderApproveRequestComponent', () => {
  let component: ProviderApproveRequestComponent;
  let fixture: ComponentFixture<ProviderApproveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProviderApproveRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderApproveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

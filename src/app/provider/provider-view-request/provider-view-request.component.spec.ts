import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderViewRequestComponent } from './provider-view-request.component';

describe('ProviderViewRequestComponent', () => {
  let component: ProviderViewRequestComponent;
  let fixture: ComponentFixture<ProviderViewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProviderViewRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderViewRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProviderApproveRequestComponent } from './provider-approve-request.component';
import { ProviderService } from '../../services/provider.service';
import { ProviderApproveRequest } from '../../models/service.model';

describe('ProviderApproveRequestComponent', () => {
  let component: ProviderApproveRequestComponent;
  let fixture: ComponentFixture<ProviderApproveRequestComponent>;
  let providerService: jasmine.SpyObj<ProviderService>;
  let router: Router;
  let messageService: MessageService;

  const mockApproveRequests: ProviderApproveRequest[] = [
    {
      request_id: '1',
      status: 'Approved',
    },
    {
      id: 2,
      status: 'Approved',
    }
  ] as ProviderApproveRequest[];

  beforeEach(async () => {
    const providerServiceSpy = jasmine.createSpyObj('ProviderService', ['viewApprovedRequest']);
    
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProviderApproveRequestComponent],
      providers: [
        { provide: ProviderService, useValue: providerServiceSpy },
        DatePipe,
        MessageService
      ]
    }).compileComponents();

    providerService = TestBed.inject(ProviderService) as jasmine.SpyObj<ProviderService>;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderApproveRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadApproveRequests on initialization', () => {
      spyOn(component, 'loadApproveRequests');
      component.ngOnInit();
      expect(component.loadApproveRequests).toHaveBeenCalled();
    });
  });

  describe('loadApproveRequests', () => {
    it('should load approve requests successfully', fakeAsync(() => {
      providerService.viewApprovedRequest.and.returnValue(
        of({ status: 'Success',message:'Success', data: mockApproveRequests })
      );

      component.loadApproveRequests();
      tick();

      expect(component.filteredRequests).toEqual(mockApproveRequests);
      expect(component.apiResponseEnd).toBe(true);
    }));

    it('should handle empty response correctly', fakeAsync(() => {
      providerService.viewApprovedRequest.and.returnValue(
        throwError(() => ({ error: { 
          status: 'Fail', 
          message: 'no approved requests found for this provider'
        } }))
      );

      component.loadApproveRequests();
      tick();

      expect(component.approveRequests).toEqual([]);
    }));

    it('should handle error response', fakeAsync(() => {
      const errorMessage = 'Error loading requests';
      providerService.viewApprovedRequest.and.returnValue(
        throwError(() => ({ error: { message: errorMessage } }))
      );

      spyOn(console, 'log');
      
      component.loadApproveRequests();
      tick();

      expect(console.log).toHaveBeenCalledWith(errorMessage);
    }));
  });

  describe('onPageChange', () => {
    it('should update currentPage and reload requests', () => {
      const newPage = 2;
      spyOn(component, 'loadApproveRequests');

      component.onPageChange(newPage);

      expect(component.currentPage).toBe(newPage);
      expect(component.apiResponseEnd).toBe(false);
      expect(component.loadApproveRequests).toHaveBeenCalled();
    });
  });

  describe('onBack', () => {
    it('should navigate to provider home', () => {
      spyOn(router, 'navigate');

      component.onBack();

      expect(router.navigate).toHaveBeenCalledWith(['/provider/home']);
    });
  });

  describe('onRefresh', () => {
    it('should call loadApproveRequests', () => {
      spyOn(component, 'loadApproveRequests');

      component.onRefresh();

      expect(component.loadApproveRequests).toHaveBeenCalled();
    });
  });

  describe('onStatusChange', () => {
    it('should call loadApproveRequests', () => {
      spyOn(component, 'loadApproveRequests');

      component.onStatusChange();

      expect(component.loadApproveRequests).toHaveBeenCalled();
    });
  });
});
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AcceptedRequestComponent } from './accepted-request.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Location } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { HouseholderService } from '../../services/householder.service';
import { AdminService } from '../../services/admin.service';
import { Role } from '../../config';
import { signal } from '@angular/core';

class MockAuthService {
  userRole = signal(Role.householder);
  isLoading = signal(false);
}
describe('AcceptedRequestComponent', () => {
  let component: AcceptedRequestComponent;
  let fixture: ComponentFixture<AcceptedRequestComponent>;
  let authService: MockAuthService;
  let householderService: jasmine.SpyObj<HouseholderService>;
  let adminService: jasmine.SpyObj<AdminService>;
  let location: jasmine.SpyObj<Location>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    authService = new MockAuthService();
    householderService = jasmine.createSpyObj('HouseholderService', [
      'currentAcceptRequestDetail',
      'approveRequest',
    ]);
    adminService = jasmine.createSpyObj('AdminService', ['approveRequest']);
    location = jasmine.createSpyObj('Location', ['back']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [AcceptedRequestComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: HouseholderService, useValue: householderService },
        { provide: AdminService, useValue: adminService },
        { provide: Location, useValue: location },
        { provide: MessageService, useValue: messageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AcceptedRequestComponent);
    component = fixture.componentInstance;
    
    householderService.currentAcceptRequestDetail.and.returnValue({
      request_id: 'requestId',
      provider_details:
        [
          {
            service_provider_id: '1',
            name: 'A',
            contact: 'test',
            address: 'test',
            price: '600',
            rating: 5,
            approve: false,
          },
          {
            service_provider_id: '2',
            name: 'B',
            contact: 'test',
            address: 'test',
            price: '500',
            rating: 4,
            approve: false,
          },
      ],
    });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize provider details on ngOnInit', () => {
    component.ngOnInit();
    expect(component.providerDetail?.length).toBe(2);
    expect(component.totalCount).toBe(2);
  });

  it('should paginate provider details correctly', fakeAsync(() => {
    component.ngOnInit();
    component.itemPerPage = 1; 
    component.applyPagination();
    console.log("idhar dekho")
    expect(component.filteredProviderDetail?.length).toEqual(1);
    tick();
    // @ts-ignore
    expect(component.filteredProviderDetail![0].service_provider_id).toEqual('1');

    component.onPageChange(2);
    expect(component.filteredProviderDetail!.length).toBe(1);
    //@ts-ignore
    expect(component.filteredProviderDetail![0].service_provider_id).toBe('2');
  }));

  it('should sort provider details by rating (high to low)', () => {
    component.ngOnInit();
    component.selectedStatus = 'Rating(high-low)';
    component.onStatusChange();
    //@ts-ignore
    expect(component.filteredProviderDetail![0].service_provider_id).toBe('1');
    //@ts-ignore
    expect(component.filteredProviderDetail![1].service_provider_id).toBe('2');
  });

  it('should sort provider details by price (low to high)', () => {
    component.ngOnInit();
    component.selectedStatus = 'Price(low-high)';
    component.onStatusChange();
    //@ts-ignore
    expect(component.filteredProviderDetail![0].service_provider_id).toBe('2');
    //@ts-ignore
    expect(component.filteredProviderDetail![1].service_provider_id).toBe('1');
  });

  it('should approve request as a householder', () => {
    component.ngOnInit();
    const mockResponse = {
      status: 'success',
      message: 'Request approved successfully',
    };
    householderService.approveRequest.and.returnValue(of(mockResponse));

    component.approveRequest('1');

    expect(householderService.approveRequest).toHaveBeenCalledWith({
      request_id: 'requestId',
      provider_id: '1',
    });
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Request approved successfully',
    });
    expect(location.back).toHaveBeenCalled();
  });

  it('should handle errors during request approval', () => {
    component.ngOnInit();
    const mockError = { error: { message: 'Approval failed' } };
    householderService.approveRequest.and.returnValue(throwError(mockError));

    component.approveRequest('1');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Approval failed',
    });
    expect(location.back).toHaveBeenCalled();
  });

  it('should navigate back on onBack', () => {
    component.onBack();
    expect(location.back).toHaveBeenCalled();
  });
});

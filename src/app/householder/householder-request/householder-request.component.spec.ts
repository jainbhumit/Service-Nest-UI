import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Router, RouterEvent } from '@angular/router';
import { MessageService } from 'primeng/api';

import { HouseholderRequestComponent } from './householder-request.component';
import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Role } from '../../config';
import { Booking, ProviderInfo } from '../../models/service.model';
import { signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockAuthService {
  userRole = signal<Role>(Role.householder);
  isLoading = signal<boolean>(false);
}
describe('HouseholderRequestComponent', () => {
  let component: HouseholderRequestComponent;
  let fixture: ComponentFixture<HouseholderRequestComponent>;
  let mockAuthService: MockAuthService;
  let mockHouseholderService: jasmine.SpyObj<HouseholderService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockHouseholderService = jasmine.createSpyObj(
      'HouseholderService',
      ['fetchBookings', 'cancelServiceRequest'],
      {
        currentAcceptRequestDetail: signal<{
          request_id: string;
          provider_details: ProviderInfo[];
        }>({request_id:'',provider_details:[]}),
      }
    );
    mockAdminService = jasmine.createSpyObj('AdminService', [
      'fetchBookings',
      'cancelServiceRequest',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [HouseholderRequestComponent],
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: HouseholderService, useValue: mockHouseholderService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();
    mockAuthService.userRole.set(Role.householder);
    const bookings: Booking[] = [
      { request_id: '1', status: 'Pending' } as Booking,
    ];
    mockAdminService.fetchBookings.and.returnValue(
      of({ status: 'sucess', message: 'sucess', data: bookings })
    );
    mockHouseholderService.fetchBookings.and.returnValue(
      of({ status: 'sucess', message: 'sucess', data: bookings })
    );
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true),
    } as any);
    fixture = TestBed.createComponent(HouseholderRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load bookings for householder role', () => {
      const loadBookingsSpy = spyOn(component, 'loadBookings');
      component.ngOnInit();
      expect(component.userRole).toBe(Role.householder);
      expect(loadBookingsSpy).toHaveBeenCalled();
    });

    it('should open dialog and load bookings for admin role', () => {
      mockAuthService.userRole.set(Role.admin);
      component.userRole = Role.admin;
      const dialogRefMock = { afterClosed: () => of(true) };
      mockDialog.open.and.returnValue(dialogRefMock as any);

      const loadBookingsSpy = spyOn(component, 'loadBookings');
      component.ngOnInit();

      expect(mockDialog.open).toHaveBeenCalled();
      expect(loadBookingsSpy).toHaveBeenCalled();
    });
  });

  describe('loadBookings', () => {
    it('should fetch householder bookings and set filteredBookings', () => {
      component.userRole = Role.householder;
      const bookings: Booking[] = [
        { request_id: '1', status: 'Pending' } as Booking,
      ];
      mockHouseholderService.fetchBookings.and.returnValue(
        of({ status: 'sucess', message: 'Success', data: bookings })
      );

      component.loadBookings();

      expect(mockHouseholderService.fetchBookings).toHaveBeenCalled();
      expect(component.filteredBookings).toEqual(bookings);
    });

    it('should fetch admin bookings and set filteredBookings', () => {
      component.userRole = Role.admin;
      const bookings: Booking[] = [
        { request_id: '1', status: 'Pending' } as Booking,
      ];
      mockAdminService.fetchBookings.and.returnValue(
        of({ status: 'success', message: 'Success', data: bookings })
      );

      component.loadBookings();

      expect(mockAdminService.fetchBookings).toHaveBeenCalledWith(
        component.itemsPerPage,
        component.currentPage,
        component.selectedStatus
      );
      expect(component.filteredBookings).toEqual(bookings);
    });

    it('should handle error while fetching bookings', () => {
      component.userRole = Role.householder;
      mockHouseholderService.fetchBookings.and.returnValue(
        throwError({ error: { message: 'Error' } })
      );

      component.loadBookings();

      expect(component.filteredBookings).toEqual([]);
    });
  });

  describe('cancelRequest', () => {
    it('should cancel a request and update the status', () => {
      component.userRole = Role.householder;
      const bookings: Booking[] = [
        { request_id: '1', status: 'Pending' } as Booking,
      ];
      const mockRequestId = '1';
      component.filteredBookings = bookings;
      mockHouseholderService.cancelServiceRequest.and.returnValue(
        of({ status: 'success', message: 'Request cancelled successfully' })
      );
      component.cancelRequest(mockRequestId);

      expect(mockHouseholderService.cancelServiceRequest).toHaveBeenCalled();
      expect(component.filteredBookings[0].status).toBe('Cancelled');
    });

    it('should handle error when cancelling a request', () => {
      component.userRole = Role.householder;
      mockHouseholderService.cancelServiceRequest.and.returnValue(
        throwError({
          error: { status: 'fail', message: 'Error cancelling request' },
        })
      );

      component.cancelRequest('1');

      expect(mockHouseholderService.cancelServiceRequest).toHaveBeenCalled();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Not Allow',
        detail: 'Error cancelling request',
      });
    });
  });
  describe('navigateToDetails', () => {
    it('should navigate to householder accept request page when provider details exist', () => {
      const providerDetails: ProviderInfo[] = [
        { service_provider_id: '1', name: 'Provider 1' } as ProviderInfo,
      ];
      const requestId = '123';
      component.userRole = Role.householder;

      component.navigateToDetails(providerDetails, requestId);

      expect(mockHouseholderService.currentAcceptRequestDetail()).toEqual({
        request_id: requestId,
        provider_details: providerDetails,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/householder/requests/accept',
      ]);
    });

    it('should navigate to admin accept request page when provider details exist and user is admin', () => {
      const providerDetails: ProviderInfo[] = [
        { service_provider_id: '1', name: 'Provider 1' } as ProviderInfo,
      ];
      const requestId = '123';
      component.userRole = Role.admin;

      component.navigateToDetails(providerDetails, requestId);

      expect(mockHouseholderService.currentAcceptRequestDetail()).toEqual({
        request_id: requestId,
        provider_details: providerDetails,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/admin/requests/accept',
      ]);
    });

    it('should not navigate when provider details array is empty', () => {
      component.navigateToDetails([], '123');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update currentPage and reload bookings', () => {
      const loadBookingsSpy = spyOn(component, 'loadBookings');
      const newPage = 2;

      component.onPageChange(newPage);

      expect(component.currentPage).toBe(newPage);
      expect(component.apiResponseEnd).toBe(false);
      expect(loadBookingsSpy).toHaveBeenCalled();
    });
  });

  describe('updateRequest', () => {
    it('should open edit dialog and update booking on success', () => {
      const requestId = '123';
      const scheduleTime = '2024-01-01';
      const newScheduleTime = '2024-01-02';
      component.filteredBookings = [
        { request_id: requestId, scheduled_time: scheduleTime } as Booking,
      ];

      mockDialog.open.and.returnValue({
        afterClosed: () => of(newScheduleTime),
      } as any);

      component.updateRequest(requestId, scheduleTime);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.filteredBookings[0].scheduled_time).toBe(
        newScheduleTime
      );
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'request update successfully',
      });
    });

    it('should not update booking when dialog is cancelled', () => {
      const requestId = '123';
      const scheduleTime = '2024-01-01';
      component.filteredBookings = [
        { request_id: requestId, scheduled_time: scheduleTime } as Booking,
      ];

      mockDialog.open.and.returnValue({
        afterClosed: () => of(null),
      } as any);

      component.updateRequest(requestId, scheduleTime);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.filteredBookings[0].scheduled_time).toBe(scheduleTime);
      expect(mockMessageService.add).not.toHaveBeenCalled();
    });
  });

  describe('onRefresh', () => {
    it('should call loadBookings', () => {
      const loadBookingsSpy = spyOn(component, 'loadBookings');

      component.onRefresh();

      expect(loadBookingsSpy).toHaveBeenCalled();
    });
  });

  describe('onBack', () => {
    it('should navigate to householder home page for householder role', () => {
      component.userRole = Role.householder;

      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/householder/home']);
    });

    it('should navigate to admin home page for admin role', () => {
      component.userRole = Role.admin;

      component.onBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/home']);
    });
  });

  describe('onStatusChange', () => {
    it('should call loadBookings', () => {
      const loadBookingsSpy = spyOn(component, 'loadBookings');

      component.onStatusChange();

      expect(loadBookingsSpy).toHaveBeenCalled();
    });
  });

  describe('cancelRequest for admin role', () => {
    beforeEach(() => {
      component.userRole = Role.admin;
    });

    it('should cancel request successfully as admin', () => {
      const requestId = '1';
      component.filteredBookings = [
        { request_id: requestId, status: 'Pending' } as Booking,
      ];
      mockAdminService.cancelServiceRequest.and.returnValue(
        of({ status: 'success', message: 'Request cancelled successfully' })
      );
      mockDialog.open.and.returnValue({
        afterClosed: () => of(true),
      } as any);

      component.cancelRequest(requestId);

      expect(mockAdminService.cancelServiceRequest).toHaveBeenCalledWith(
        requestId
      );
      expect(component.filteredBookings[0].status).toBe('Cancelled');
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Request cancelled successfully',
      });
    });

    it('should handle error when cancelling request as admin', () => {
      const requestId = '1';
      mockAdminService.cancelServiceRequest.and.returnValue(
        throwError({ error: { message: 'Error cancelling request' } })
      );
      mockDialog.open.and.returnValue({
        afterClosed: () => of(true),
      } as any);

      component.cancelRequest(requestId);

      expect(mockAdminService.cancelServiceRequest).toHaveBeenCalledWith(
        requestId
      );
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Not Allow',
        detail: 'Error cancelling request',
      });
    });
  });
});

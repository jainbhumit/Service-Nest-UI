import { ApproveRequests } from './../../models/service.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveRequestComponent } from './approve-request.component';
import { UserService } from '../../services/user.service';
import { HouseholderService } from '../../services/householder.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { Role } from '../../config';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DateTimePipe } from '../../pipes/date-time.pipe';
import { DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { AdminService } from '../../services/admin.service';
import { compilePipeFromMetadata } from '@angular/compiler';
import { AddReviewFormComponent } from '../add-review-form/add-review-form.component';

class MockAuthService {
  isLoading = signal<boolean>(false);
  userRole = signal<Role>(Role.householder);
}
describe('ApproveRequestComponent', () => {
  let component: ApproveRequestComponent;
  let fixture: ComponentFixture<ApproveRequestComponent>;
  let mockAuthService: MockAuthService;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockHouseholderService: jasmine.SpyObj<HouseholderService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<ApproveRequestComponent>>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;
  let mockResponse: ApproveRequests[];
  let mockRouter: Router;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockAuthService.userRole.set(Role.householder);
    mockHouseholderService = jasmine.createSpyObj('HouseholderService', [
      'viewApprovedRequest',
      'cancelServiceRequest',
    ]);
    mockAdminService = jasmine.createSpyObj('AdminService',['viewApprovedRequest','cancelServiceRequest']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', [
      'open',
      'close',
      'afterClosed',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
    mockResponse = [
      {
        request_id: '1',
        service_name: 'test',
        service_id: 'test1',
        requested_time: '',
        scheduled_time: '',
        status: '',
        provider_details: undefined,
      },
      {
        request_id: '2',
        service_name: 'test',
        service_id: 'test2',
        requested_time: '',
        scheduled_time: '',
        status: '',
        provider_details: undefined,
      },
    ];
    await TestBed.configureTestingModule({
      declarations: [ApproveRequestComponent],
      imports: [
        FormsModule,
        MatDialogModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        HttpClientModule,
        RouterLink,
        DateTimePipe,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: AuthService, useValue: mockAuthService },
        { provide: HouseholderService, useValue: mockHouseholderService },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: AdminService,useValue: mockAdminService},
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => 'mock-value',
              },
            },
          },
        },
        DatePipe,
      ],
    }).compileComponents();

    mockHouseholderService.viewApprovedRequest.and.returnValue(
      of({
        status: 'sucess',
        message: 'approve request fetched successfully',
        data: mockResponse,
      })
    );
    mockAdminService.viewApprovedRequest.and.returnValue(
      of({
        status: 'sucess',
        message: 'approve request fetched successfully',
        data: mockResponse,
      })
    );
    fixture = TestBed.createComponent(ApproveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    mockAuthService.userRole.set(Role.householder);
    expect(component).toBeTruthy();
  });
  
  it('should load the request onInit', () => {
    component.ngOnInit();
    expect(component.filteredRequests.length).toBe(2);
    expect(component.filteredRequests).toBe(mockResponse);
  });

  it('should call ngOnInit by admin role',() => {
    mockAuthService.userRole.set(Role.admin);
    const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
    component.ngOnInit()
    component.userRole= Role.admin
    expect(dialogSpy).toHaveBeenCalled();
    expect(component.filteredRequests.length).toBe(2)
    expect(component.filteredRequests).toBe(mockResponse);
  })

  it('should load the request as householder if there is no data ', () => {
    mockHouseholderService.viewApprovedRequest.and.returnValue(of({
      status:'success',
      message:'No service request found',
      data:[]
    }))
    component.loadApproveRequests();
    expect(component.filteredRequests.length).toBe(0)
  })
  it('should load the request as admin if there is no data ', () => {
    mockAuthService.userRole.set(Role.admin);
    mockAdminService.viewApprovedRequest.and.returnValue(of({
      status:'sucess',
      message:'No service request found',
      data:[]
    }))
    component.userRole = Role.admin
    component.loadApproveRequests();
    expect(component.userRole).toBe(Role.admin);
    expect(component.filteredRequests.length).toBe(0)
  })

  it('should navigate to householder home on back button click if role is householder', () => {
    mockAuthService.userRole.set(Role.householder);
    component.onBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/householder/home']);
  });
  
  it('should navigate to admin home on back button click if role is admin', () => {
    component.userRole = Role.admin;
    component.onBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/home']);
  });
  
  it('should refresh requests on refresh action', () => {
    spyOn(component, 'loadApproveRequests');
    component.onRefresh();
    expect(component.loadApproveRequests).toHaveBeenCalled();
  });
  
  it('should load requests when status changes', () => {
    spyOn(component, 'loadApproveRequests');
    component.onStatusChange();
    expect(component.loadApproveRequests).toHaveBeenCalled();
  });
  
  it('should update request on EditRequestDialogComponent close', () => {
    const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
  
    component.updateRequest('123', '2024-11-24T10:00:00');
    expect(dialogSpy).toHaveBeenCalled();
  });
  
  it('should cancel request as householder successfully', () => {
    mockAuthService.userRole.set(Role.householder);
    mockHouseholderService.cancelServiceRequest.and.returnValue(of({
      status:'success',
      message: 'Request cancelled successfully',
    }));
  
    const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
  
    component.cancelRequest('123');
    expect(dialogSpy).toHaveBeenCalled();
    expect(mockHouseholderService.cancelServiceRequest).toHaveBeenCalledWith('123');
  });
  
  it('should handle cancel request error as householder', () => {
    mockAuthService.userRole.set(Role.householder);
    mockHouseholderService.cancelServiceRequest.and.returnValue(
      of({status:'fail', message: 'Cancel request failed' })
    );
  
    const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
  
    component.cancelRequest('123');
    expect(dialogSpy).toHaveBeenCalled();
    expect(mockHouseholderService.cancelServiceRequest).toHaveBeenCalledWith('123');
  });
  
  it('should leave a review if conditions are met', () => {
    const dialogSpy = spyOn(component['dialog'], 'open');
    component.LeaveReview('provider123', 'service456');
    expect(dialogSpy).toHaveBeenCalledWith(AddReviewFormComponent, {
      width: '450px',
      data: { service_id: 'service456', provider_id: 'provider123' },
    });
  });
  
  it('should correctly determine if user can leave review', () => {
    const pastTime = new Date(new Date().getTime() - 3600000).toISOString(); // 1 hour ago
    const futureTime = new Date(new Date().getTime() + 3600000).toISOString(); // 1 hour in future
  
    expect(component.canLeaveReview(pastTime)).toBe(true);
    expect(component.canLeaveReview(futureTime)).toBe(false);
  });
  
  it('should handle pagination and load more requests', () => {
    spyOn(component, 'loadApproveRequests');
    component.onPageChange(2);
    expect(component.currentPage).toBe(2);
    expect(component.loadApproveRequests).toHaveBeenCalled();
  });
});

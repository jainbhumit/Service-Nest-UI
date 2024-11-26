import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { RequestCategoryComponent } from './request-category.component';
import { UserService } from './../../services/user.service';
import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { ProviderService } from '../../services/provider.service';
import { Role } from '../../config';
import { AddServiceFormComponent } from './../../provider/add-service-form/add-service-form.component';
import { RequestServiceFormComponent } from '../../householder/request-service-form/request-service-form.component';
import { ConfirmCancelRequestComponentComponent } from '../../householder/confirm-cancel-request-component/confirm-cancel-request-component.component';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ProviderServiceDetail, Service } from '../../models/service.model';
import { AveragePipe } from '../../pipes/average.pipe';

class MockAuthService {
  userRole = signal<Role>(Role.householder);
  isLoading = signal<boolean>(false);
}
describe('RequestCategoryComponent', () => {
  let component: RequestCategoryComponent;
  let fixture: ComponentFixture<RequestCategoryComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockHouseholderService: jasmine.SpyObj<HouseholderService>;
  let mockAuthService: MockAuthService;
  let mockProviderService: jasmine.SpyObj<ProviderService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockCurrentService = {
    name: 'Plumbing',
    id: '1',
    description: 'Plumbing services'
  };

  const mockProviderResponse = {
    status:'success',
    message:'sucess',
    data: [
      {
        provider_name: 'John Doe',
        avg_rating: 4.5,
        price: 100,
        rating_count: 10
      },
      {
        provider_name: 'Jane Smith',
        avg_rating: 4.0,
        price: 120,
        rating_count: 8
      }
    ] as Service[]
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockUserService = jasmine.createSpyObj('UserService', ['currentService']);
    mockHouseholderService = jasmine.createSpyObj('HouseholderService', ['getServiceByCategory']);
    mockAuthService = new MockAuthService();
    mockProviderService = jasmine.createSpyObj('ProviderService', ['getProviderService', 'deleteService']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    mockUserService.currentService.and.returnValue(mockCurrentService);
    mockUserService.currentService.and.returnValue(mockCurrentService);
    mockHouseholderService.getServiceByCategory.and.returnValue(of(mockProviderResponse));
    mockProviderService.getProviderService.and.returnValue(of({status:'success',message:'', data: [] }));

    await TestBed.configureTestingModule({
      declarations: [ RequestCategoryComponent, AveragePipe],
      providers: [RouterLink,
        { provide: Router, useValue: mockRouter },
        { provide: UserService, useValue: mockUserService },
        { provide: HouseholderService, useValue: mockHouseholderService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProviderService, useValue: mockProviderService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MessageService, useValue: mockMessageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestCategoryComponent);
    component = fixture.componentInstance;
    component.currentService = mockCurrentService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize for householder role', fakeAsync(() => {
      mockHouseholderService.getServiceByCategory.and.returnValue(of(mockProviderResponse));
      
      fixture.detectChanges();
      tick();

      expect(component.availableProviders).toBe(2);
      expect(component.avgPrice).toBe(110);
      expect(component.providers.length).toBe(2);
    }));

    it('should handle error in getServiceByCategory', fakeAsync(() => {
      const errorMessage = { error: { message: 'Error fetching services' } };
      mockHouseholderService.getServiceByCategory.and.returnValue(
        throwError(() => errorMessage)
      );
      
      spyOn(console, 'log');
      fixture.detectChanges();
      tick();

      expect(console.log).toHaveBeenCalledWith(errorMessage.error.message);

    }));

    it('should initialize for service provider role', fakeAsync(() => {
     mockAuthService.userRole.set(Role.serviceProvider);
     component.userRole = Role.serviceProvider;
      mockProviderService.getProviderService.and.returnValue(of({
        status:'success',
        message:'success',
        data: [{
          category: 'Plumbing',
          id: '1'
        }] as ProviderServiceDetail[]
      }));

      component.ngOnInit();
      fixture.detectChanges();
      tick();

      expect(component.isServiceAdded).toBeTrue();
    }));
  });

  describe('requestService', () => {
    beforeEach(()=> {
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(true));
      mockDialog.open.and.returnValue(dialogRef);
    })
    it('should open request service dialog for householder', () => {
      component.requestService();

      expect(mockDialog.open).toHaveBeenCalledWith(
        RequestServiceFormComponent,
        {
          width: '450px',
          data: { category: 'Plumbing' }
        }
      );
    });
  });

  describe('addService', () => {
    beforeEach(() => {
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(true));
      mockDialog.open.and.returnValue(dialogRef);
    })
    it('should show message if service is already added', () => {
      component.isServiceAdded = true;
      
      component.addService();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info',
        detail: 'Service already added'
      });
    });

    it('should open add service dialog if service is not added', () => {
      component.isServiceAdded = false;

      component.addService();

      expect(mockDialog.open).toHaveBeenCalledWith(
        AddServiceFormComponent,
        {
          width: '450px',
          data: { category: 'Plumbing', is_update: false }
        }
      );
    });
  });

  describe('cancelService', () => {
    beforeEach(() => {
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(true));
      mockDialog.open.and.returnValue(dialogRef);
    })
    it('should cancel service successfully', fakeAsync(() => {
      mockProviderService.deleteService.and.returnValue(of({ status: 'success',message:'success'}));

      component.cancelService('1');
      tick();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Service cancel Succesfully'
      });
    }));

    it('should handle cancel service error', fakeAsync(() => {
      mockProviderService.deleteService.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.cancelService('1');
      tick();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error cancelling service'
      });
    }));
  });

  describe('navigation methods', () => {
    it('should navigate back based on user role', () => {
      mockAuthService.userRole.set(Role.householder);
      component.userRole = Role.householder;
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/householder/home']);

      mockAuthService.userRole.set(Role.serviceProvider);
      component.userRole = Role.serviceProvider;

      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/provider/home']);

      mockAuthService.userRole.set(Role.admin);
      component.userRole = Role.admin;

      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/home']);
    });

    it('should return correct router link based on user role', () => {
      component.userRole = Role.householder;
      expect(component.getRouterLink('test')).toBe('/householder/test');

      component.userRole = Role.serviceProvider;
      expect(component.getRouterLink('test')).toBe('/provider/test');

      component.userRole = Role.admin
      expect(component.getRouterLink('test')).toBe('/admin/test');
    });
  });
});
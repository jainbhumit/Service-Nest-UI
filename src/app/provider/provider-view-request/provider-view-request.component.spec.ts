import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProviderViewRequestComponent } from './provider-view-request.component';
import { ProviderService } from '../../services/provider.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AcceptServiceDialogComponent } from '../accept-service-dialog/accept-service-dialog.component';
import { ProviderViewRequest, ServiceCategory } from '../../models/service.model';

describe('ProviderViewRequestComponent', () => {
  let component: ProviderViewRequestComponent;
  let fixture: ComponentFixture<ProviderViewRequestComponent>;
  let providerService: jasmine.SpyObj<ProviderService>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: Router;

  const mockCategories = {
    status: 'Success',
    message:'success',
    data: [
      { id: '1', name: 'Plumbing' },
      { id: '2', name: 'Electrical' }
    ] as ServiceCategory[]
  };

  const mockRequests: ProviderViewRequest[] = [
    {
      request_id: '1',
      service_name: 'Plumbing',
      service_id: '1',
    },
    {
      request_id: '2',
      service_name: 'Electrical',
      service_id: '2',
    }
  ] as ProviderViewRequest[];

  beforeEach(async () => {
    const providerServiceSpy = jasmine.createSpyObj('ProviderService', ['viewServiceRequest']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['fetchCategories']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoading: { update: jasmine.createSpy('update') }
    });
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProviderViewRequestComponent],
      providers: [
        { provide: ProviderService, useValue: providerServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    providerService = TestBed.inject(ProviderService) as jasmine.SpyObj<ProviderService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderViewRequestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      userService.fetchCategories.and.returnValue(of(mockCategories));
      providerService.viewServiceRequest.and.returnValue(of({status:'success',message:'success', data: mockRequests }));
    });

    it('should fetch categories and service requests on initialization', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(userService.fetchCategories).toHaveBeenCalled();
      expect(providerService.viewServiceRequest).toHaveBeenCalled();
      expect(component.categories.size).toBe(2);
      expect(component.categories.get('1')).toBe('Plumbing');
      expect(authService.isLoading.update).toHaveBeenCalledTimes(2);
    }));

    it('should handle category fetch error', fakeAsync(() => {
      const error = { error: { message: 'Failed to fetch categories' } };
      userService.fetchCategories.and.returnValue(throwError(() => error));
      spyOn(console, 'log');

      component.ngOnInit();
      tick();

      expect(console.log).toHaveBeenCalledWith(error.error.message);
    }));
  });

  describe('loadRequests', () => {
    it('should load requests successfully', fakeAsync(() => {
      providerService.viewServiceRequest.and.returnValue(
        of({status:'success',message:'success',data: mockRequests })
      );

      component.loadRequests();
      tick();

      expect(component.paginatedRequest).toEqual(mockRequests);
      expect(component.apiResponseEnd).toBe(true);
    }));

    it('should handle empty requests response', fakeAsync(() => {
      providerService.viewServiceRequest.and.returnValue(
        of({status:'sucess', message: 'No pending service requests available',data:[] })
      );

      component.loadRequests();
      tick();

      expect(component.paginatedRequest).toEqual([]);
      expect(component.apiResponseEnd).toBe(true);
    }));

    it('should handle error response', fakeAsync(() => {
      const error = { error: { message: 'Error loading requests' } };
      providerService.viewServiceRequest.and.returnValue(throwError(() => error));
      spyOn(console, 'log');

      component.loadRequests();
      tick();

      expect(console.log).toHaveBeenCalledWith(error.error.message);
    }));
  });

  describe('acceptRequest', () => {
    it('should open dialog and handle successful acceptance', fakeAsync(() => {
      const mockDialogRef = {
        afterClosed: () => of(true)
      } as MatDialogRef<AcceptServiceDialogComponent>;
      
      dialog.open.and.returnValue(mockDialogRef);
      spyOn(component, 'loadRequests');

      component.acceptRequest('1');
      tick();

      expect(dialog.open).toHaveBeenCalledWith(AcceptServiceDialogComponent, {
        width: '450px',
        data: { request_id: '1' }
      });
      expect(component.loadRequests).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Service added successfully'
      });
    }));

    it('should not reload requests if dialog is cancelled', fakeAsync(() => {
      const mockDialogRef = {
        afterClosed: () => of(false)
      } as MatDialogRef<AcceptServiceDialogComponent>;
      
      dialog.open.and.returnValue(mockDialogRef);
      spyOn(component, 'loadRequests');

      component.acceptRequest('1');
      tick();

      expect(component.loadRequests).not.toHaveBeenCalled();
      expect(messageService.add).not.toHaveBeenCalled();
    }));
  });

  describe('onPageChange', () => {
    it('should update currentPage and reload requests', () => {
      const newPage = 2;
      spyOn(component, 'loadRequests');

      component.onPageChange(newPage);

      expect(component.currentPage).toBe(newPage);
      expect(component.apiResponseEnd).toBe(false);
      expect(component.loadRequests).toHaveBeenCalled();
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
    it('should call loadRequests', () => {
      spyOn(component, 'loadRequests');

      component.onRefresh();

      expect(component.loadRequests).toHaveBeenCalled();
    });
  });

  describe('onStatusChange', () => {
    it('should call loadRequests', () => {
      spyOn(component, 'loadRequests');

      component.onStatusChange();

      expect(component.loadRequests).toHaveBeenCalled();
    });
  });
});
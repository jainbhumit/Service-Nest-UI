import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { AcceptServiceDialogComponent } from './accept-service-dialog.component';
import { ProviderService } from '../../services/provider.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../config';
import { signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminUser } from '../../models/user.model';

describe('AcceptServiceDialogComponent', () => {
  let component: AcceptServiceDialogComponent;
  let fixture: ComponentFixture<AcceptServiceDialogComponent>;
  let mockProviderService: jasmine.SpyObj<ProviderService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockAuthService: MockAuthService;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AcceptServiceDialogComponent>>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockDialogData = {
    request_id: '123'
  };
class MockAuthService{
  userRole = signal<Role>(Role.serviceProvider);
  isLoading = signal<boolean>(false);
}
  beforeEach(async () => {
    mockProviderService = jasmine.createSpyObj('ProviderService', ['acceptServiceRequest']);
    mockAdminService = jasmine.createSpyObj('AdminService', ['getUser']);
    mockAuthService = new MockAuthService();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ AcceptServiceDialogComponent ],
      imports: [ ReactiveFormsModule,MatDialogModule,MatInputModule,MatFormFieldModule,BrowserAnimationsModule ],
      providers: [
        { provide: ProviderService, useValue: mockProviderService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MessageService, useValue: mockMessageService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcceptServiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize acceptServiceForm with empty price field', () => {
      expect(component.acceptServiceForm.get('price')).toBeTruthy();
      expect(component.acceptServiceForm.get('price')?.value).toBe('');
    });

    it('should initialize emailForm with empty email field', () => {
      expect(component.emailForm.get('email')).toBeTruthy();
      expect(component.emailForm.get('email')?.value).toBe('');
    });
  });

  describe('Service Provider Flow', () => {
    beforeEach(() => {
      mockAuthService.userRole.set(Role.serviceProvider);
    });

    it('should handle successful service acceptance', () => {
      const mockResponse = { status:'success',message: 'success' };
      mockProviderService.acceptServiceRequest.and.returnValue(of(mockResponse));

      component.acceptServiceForm.get('price')?.setValue('100');
      component.onSubmit();

      expect(mockProviderService.acceptServiceRequest).toHaveBeenCalledWith({
        request_id: '123',
        price: '100'
      });
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Service Accept successfully'
      });
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle provider not found error', () => {
      const mockResponse = { status:'success',message: 'provider not found' };
      mockProviderService.acceptServiceRequest.and.returnValue(of(mockResponse));

      component.acceptServiceForm.get('price')?.setValue('100');
      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warning',
        summary: 'Warning',
        detail: 'you did not have this service'
      });
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle service request not found error', () => {
      mockProviderService.acceptServiceRequest.and.returnValue(
        throwError(() => ({ error: { message: 'service request not found' } }))
      );

      component.acceptServiceForm.get('price')?.setValue('100');
      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warning',
        summary: 'Warning',
        detail: 'you did not have this service'
      });
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle generic error', () => {
      mockProviderService.acceptServiceRequest.and.returnValue(
        throwError(() => ({ error: { message: 'generic error' } }))
      );

      component.acceptServiceForm.get('price')?.setValue('100');
      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'generic error'
      });
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Admin Flow', () => {
    beforeEach(() => {
      mockAuthService.userRole.set(Role.admin);
      component.userRole = Role.admin;
    });

    it('should handle successful user lookup', () => {
      const mockResponse = { status:'success',message:'success',data: { id: 'user123' } as AdminUser };
      mockAdminService.getUser.and.returnValue(of(mockResponse));

      component.emailForm.get('email')?.setValue('test@example.com');
      component.onSubmit();

      expect(mockAdminService.getUser).toHaveBeenCalledWith('test@example.com');
      expect(mockAdminService.userId).toBe('user123');
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle user lookup error', () => {
      mockAdminService.getUser.and.returnValue(
        throwError(() => ({ error: { message: 'User not found' } }))
      );

      component.emailForm.get('email')?.setValue('test@example.com');
      component.onSubmit();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'User not found'
      });
    });
  });

  describe('Dialog Actions', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
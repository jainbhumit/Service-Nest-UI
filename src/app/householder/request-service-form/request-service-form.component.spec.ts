import { MatFormFieldModule } from '@angular/material/form-field';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';

import { RequestServiceFormComponent } from './request-service-form.component';
import { HouseholderService } from '../../services/householder.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';
import { Role } from '../../config';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

class MockAuthService {
  userRole = signal<Role>(Role.householder);
  isLoading = signal<boolean>(false);
}
describe('RequestServiceFormComponent', () => {
  let component: RequestServiceFormComponent;
  let fixture: ComponentFixture<RequestServiceFormComponent>;

  let mockDialogRef: jasmine.SpyObj<MatDialogRef<RequestServiceFormComponent>>;
  let mockHouseholderService: jasmine.SpyObj<HouseholderService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockHouseholderService = jasmine.createSpyObj('HouseholderService', ['requestService']);
    mockAdminService = jasmine.createSpyObj('AdminService', ['requestService']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      declarations: [RequestServiceFormComponent],
      imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatDialogModule,BrowserAnimationsModule,MatDatepickerModule,MatNativeDateModule],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { category: 'Cleaning', user_id: '123' } },
        { provide: HouseholderService, useValue: mockHouseholderService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestServiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    const form = component.requestServiceForm;

    expect(form.controls['service_name'].value).toBe('');
    expect(form.controls['category'].value).toBe('Cleaning');
    expect(form.controls['description'].value).toBe('');
    expect(form.controls['scheduled_date'].value).toBe('');
    expect(form.controls['scheduled_time'].value).toBe('');
  });

  it('should close the dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should not submit the form if invalid', () => {
    const form = component.requestServiceForm;
    form.controls['service_name'].setValue('');
    form.controls['description'].setValue('');
    form.controls['scheduled_date'].setValue('');
    form.controls['scheduled_time'].setValue('');

    component.onSubmit();

    expect(mockHouseholderService.requestService).not.toHaveBeenCalled();
    expect(mockAdminService.requestService).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should call HouseholderService on valid form submission for Householder role', () => {
    const form = component.requestServiceForm;
    form.controls['service_name'].setValue('General Cleaning');
    form.controls['description'].setValue('Clean the house');
    form.controls['scheduled_date'].setValue('2024-11-25');
    form.controls['scheduled_time'].setValue('14:30');

    mockHouseholderService.requestService.and.returnValue(of({ status: 'success',message:'success',data:{request_id:'1'} }));

    component.onSubmit();

    expect(mockHouseholderService.requestService).toHaveBeenCalledWith({
      service_name: 'General Cleaning',
      category: 'Cleaning',
      description: 'Clean the house',
      scheduled_time: '2024-11-25 14:30',
    });
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Request successfully',
    });
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call AdminService on valid form submission for Admin role', () => {
    component.userRole = Role.admin

    const form = component.requestServiceForm;
    form.controls['service_name'].setValue('General Cleaning');
    form.controls['description'].setValue('Clean the house');
    form.controls['scheduled_date'].setValue('2024-11-25');
    form.controls['scheduled_time'].setValue('14:30');

    mockAdminService.requestService.and.returnValue(of({ status: 'success',message:'success',data:{request_id:'1'} }));

    component.onSubmit();

    expect(mockAdminService.requestService).toHaveBeenCalledWith({
      service_name: 'General Cleaning',
      category: 'Cleaning',
      description: 'Clean the house',
      scheduled_time: '2024-11-25 14:30',
    });
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Request successfully',
    });
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle errors on service request', () => {
    const form = component.requestServiceForm;
    form.controls['service_name'].setValue('General Cleaning');
    form.controls['description'].setValue('Clean the house');
    form.controls['scheduled_date'].setValue('2024-11-25');
    form.controls['scheduled_time'].setValue('14:30');

    mockHouseholderService.requestService.and.returnValue(
      throwError({ error: { message: 'Request failed' } })
    );

    component.onSubmit();

    expect(mockMessageService.add).not.toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Request successfully',
    });
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});

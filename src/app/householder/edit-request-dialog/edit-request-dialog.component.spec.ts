import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditRequestDialogComponent } from './edit-request-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { Role } from '../../config';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditRequestDialogComponent', () => {
  let component: EditRequestDialogComponent;
  let fixture: ComponentFixture<EditRequestDialogComponent>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<EditRequestDialogComponent>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockHouseholderService: jasmine.SpyObj<HouseholderService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['userRole'], {
      isLoading: { update: jasmine.createSpy('update') },
    });
    mockHouseholderService = jasmine.createSpyObj('HouseholderService', ['updateServiceRequest']);
    mockAdminService = jasmine.createSpyObj('AdminService', ['updateServiceRequest']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [EditRequestDialogComponent],
      imports: [ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { request_id: '123', scheduled_time: '2024-11-25T10:00' } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: HouseholderService, useValue: mockHouseholderService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: DatePipe, useClass: DatePipe },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog with false if form is invalid on confirm', () => {
    component.scheduledTime.setValue('');
    component.onConfirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should call householder service if user role is householder', () => {
    mockAuthService.userRole.and.returnValue(Role.householder);
    component.scheduledTime.setValue('2024-11-26T10:00');

    mockHouseholderService.updateServiceRequest.and.returnValue(of({status:'sucess',message:'Request update succesfully'}));

    component.onConfirm();

    expect(mockAuthService.isLoading.update).toHaveBeenCalledWith(jasmine.any(Function));
    expect(mockHouseholderService.updateServiceRequest).toHaveBeenCalledWith({
      id: '123',
      scheduled_time: '2024-11-26 10:00',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith('2024-11-26 10:00');
  });

  it('should call admin service if user role is admin', () => {
    mockAuthService.userRole.and.returnValue(Role.admin);
    component.scheduledTime.setValue('2024-11-26T10:00');

    mockAdminService.updateServiceRequest.and.returnValue(of({status:'sucess',message:'Request update succesfully'}));

    component.onConfirm();

    expect(mockAuthService.isLoading.update).toHaveBeenCalledWith(jasmine.any(Function));
    expect(mockAdminService.updateServiceRequest).toHaveBeenCalledWith({
      id: '123',
      scheduled_time: '2024-11-26 10:00',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith('2024-11-26 10:00');
  });

  it('should handle householder service error response correctly', () => {
    mockAuthService.userRole.and.returnValue(Role.householder);
    component.scheduledTime.setValue('2024-11-26T10:00');

    mockHouseholderService.updateServiceRequest.and.returnValue(
      throwError({ error: { message: 'only pending request rescheduled' } })
    );

    component.onConfirm();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Failed',
      detail: 'only pending and accepted request reschedule',
    });
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should handle admin service error response correctly', () => {
    mockAuthService.userRole.and.returnValue(Role.admin);
    component.scheduledTime.setValue('2024-11-26T10:00');

    mockAdminService.updateServiceRequest.and.returnValue(
      throwError({ error: { message: 'Failed to update request' } })
    );

    component.onConfirm();

    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should close the dialog on cancel', () => {
    component.onCancel();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});

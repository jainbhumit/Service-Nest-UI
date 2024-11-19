import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAddCategoryComponent } from './admin-add-category.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { signal } from '@angular/core';

class MockAuthService {
  // Mock the signal with `update` method
  isLoading = signal(false);  // Default value is false

  // This is the key method that should be called in the component
  update(value: boolean) {
    this.isLoading.update(() => value);  // Update the signal with the new value
  }
}
describe('AdminAddCategoryComponent', () => {
  let component: AdminAddCategoryComponent;
  let fixture: ComponentFixture<AdminAddCategoryComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AdminAddCategoryComponent>>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let authServiceSpy: MockAuthService;

  beforeEach(async () => {
    // Mock the dependencies
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['addService']);
    authServiceSpy = new MockAuthService()

    // Provide the mock services
    await TestBed.configureTestingModule({
      declarations: [AdminAddCategoryComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
      ], 
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAddCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dialogRef.close() when onCancel is called', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('should call dialogRef.close() and display success message on successful form submission', () => {
    const mockResponse = { message: 'Category added successfully!' };
    adminServiceSpy.addService.and.returnValue(of({status: "success", message:mockResponse.message}))
    component.onSubmit();
    expect(adminServiceSpy.addService).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: mockResponse.message,
    });
  });

  it('should call dialogRef.close() and display error message on form submission failure', () => {
    const mockError = { error: { message: 'Error adding category' } };
    adminServiceSpy.addService.and.returnValue(throwError(mockError));

    component.onSubmit();
    expect(adminServiceSpy.addService).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: mockError.error.message,
    });
  });
});

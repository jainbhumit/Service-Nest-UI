import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmCancelRequestComponentComponent } from './confirm-cancel-request-component.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { HouseholderService } from '../../services/householder.service';
import { Role } from '../../config';
import { signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockAuthService {
  userRole = signal<Role>(Role.householder);
  isLoading = signal<boolean>(false);
}

describe('ConfirmCancelRequestComponentComponent', () => {
  let component: ConfirmCancelRequestComponentComponent;
  let fixture: ComponentFixture<ConfirmCancelRequestComponentComponent>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<ConfirmCancelRequestComponentComponent>>;
  let mockAuthService: MockAuthService;
  let mockHouseholderService: jasmine.SpyObj<HouseholderService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAuthService = new MockAuthService();
    mockHouseholderService = jasmine.createSpyObj('HouseholderService', ['cancelServiceRequest']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [ConfirmCancelRequestComponentComponent],
      imports:[
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { is_provider: false } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: HouseholderService, useValue: mockHouseholderService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmCancelRequestComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct user role', () => {
    expect(component.userRole).toBe(Role.householder);
  });

  it('should close the dialog with true when onConfirm is called', () => {
    component.onConfirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close the dialog with false when onCancel is called', () => {
    component.onCancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});

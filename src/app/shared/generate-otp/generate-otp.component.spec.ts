import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { GenerateOtpComponent } from './generate-otp.component';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('GenerateOtpComponent', () => {
  let component: GenerateOtpComponent;
  let fixture: ComponentFixture<GenerateOtpComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['generateOtp'], {
      isLoading: signal<boolean>(false)
    });
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [GenerateOtpComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    describe('Email Validation', () => {
      it('should initialize with invalid form', () => {
        expect(component.otpForm.valid).toBeFalsy();
      });

      it('should validate required email', () => {
        const email = component.otpForm.controls['email'];
        expect(email.valid).toBeFalsy();
        expect(email.errors?.['required']).toBeTruthy();
      });

      it('should validate email format', () => {
        const email = component.otpForm.controls['email'];
        
        email.setValue('invalid-email');
        expect(email.errors?.['email']).toBeTruthy();

        email.setValue('valid@email.com');
        expect(email.errors).toBeNull();
      });
    });
  });

  describe('Email Getter', () => {
    it('should return email form control', () => {
      expect(component.email).toBe(component.otpForm.get('email'));
    });
  });

  describe('Generate OTP Method', () => {
    const validEmail = 'test@example.com';

    beforeEach(() => {
      component.otpForm.setValue({ email: validEmail });
    });

    it('should call generateOtp service method when form is valid', fakeAsync(() => {
      const mockResponse = {status:'success', message: 'Otp Sent successfully' };
      authServiceSpy.generateOtp.and.returnValue(of(mockResponse));

      spyOn(component.onGenerate, 'emit');

      component.generateOtp();
      tick();

      expect(authServiceSpy.generateOtp).toHaveBeenCalledWith(validEmail);
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Sent',
        detail: mockResponse.message
      });
      expect(component.onGenerate.emit).toHaveBeenCalledWith({
        email: validEmail,
        status: true
      });
    }));

    it('should handle error response', fakeAsync(() => {
      const errorResponse = { error: { message: 'OTP generation failed' } };
      authServiceSpy.generateOtp.and.returnValue(throwError(() => errorResponse));

      spyOn(component.onGenerate, 'emit');
      

      component.generateOtp();
      tick();

      expect(authServiceSpy.generateOtp).toHaveBeenCalledWith(validEmail);
      expect(component.errorMessage).toBe('OTP generation failed');
      expect(component.onGenerate.emit).not.toHaveBeenCalled();
      expect(messageServiceSpy.add).not.toHaveBeenCalled();
    }));

    it('should not generate OTP when form is invalid', () => {
      component.otpForm.reset();


      component.generateOtp();

      expect(authServiceSpy.generateOtp).not.toHaveBeenCalled();
    });
  });
});
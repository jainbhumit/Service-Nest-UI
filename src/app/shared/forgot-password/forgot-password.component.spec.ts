import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { GenerateOtpComponent } from '../generate-otp/generate-otp.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['forgetPassword'], {
      isLoading: signal(false)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent,GenerateOtpComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('OnGenerate Method', () => {
    it('should handle successful OTP generation', () => {
      const event = {
        email: 'test@example.com',
        status: true
      };

      component.OnGenerate(event);

      expect(component.otpStatus).toBeTruthy();
      expect(component.email?.value).toBe(event.email);
      expect(component.email?.disabled).toBeTruthy();
    });

    it('should not change form when OTP generation fails', () => {
      const event = {
        email: 'test@example.com',
        status: false
      };

      component.OnGenerate(event);

      expect(component.otpStatus).toBeFalsy();
      expect(component.email?.disabled).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.forgotForm.valid).toBeFalsy();
    });

    describe('Email Validation', () => {
      it('should validate required email', () => {
        const email = component.forgotForm.controls['email'];
        expect(email.valid).toBeFalsy();
        expect(email.errors?.['required']).toBeTruthy();
      });

      it('should validate email format', () => {
        const email = component.forgotForm.controls['email'];
        email.setValue('invalid-email');
        expect(email.errors?.['email']).toBeTruthy();

        email.setValue('valid@email.com');
        expect(email.errors).toBeNull();
      });
    });

    describe('Password Validation', () => {
      it('should validate required password', () => {
        const password = component.forgotForm.controls['updatedPassword'];
        expect(password.errors?.['required']).toBeTruthy();
      });

      it('should validate password format', () => {
        const password = component.forgotForm.controls['updatedPassword'];
        
        password.setValue('weak');
        expect(password.errors?.['invalidPassword']).toBeTruthy();
        
        password.setValue('onlylowercase123');
        expect(password.errors?.['invalidPassword']).toBeTruthy();
        
        password.setValue('ONLYUPPERCASE123');
        expect(password.errors?.['invalidPassword']).toBeTruthy();

        password.setValue('ValidPass123');
        expect(password.errors).toBeNull();
      });
    });

    describe('Otp Validation', () => {
      it('should validate required otp ', () => {
        const otp = component.forgotForm.controls['otp'];
        expect(otp.errors?.['required']).toBeTruthy();

        otp.setValue('123456');
        expect(otp.errors).toBeNull();
      });
    });
  });

  describe('Form Getters', () => {
    it('should get email control', () => {
      expect(component.email).toBe(component.forgotForm.get('email'));
    });

    it('should get password control', () => {
      expect(component.password).toBe(component.forgotForm.get('updatedPassword'));
    });

    it('should get otp control', () => {
      expect(component.otp).toBe(component.forgotForm.get('otp'));
    });
  });

  describe('ForgotPassword Method', () => {
    it('should mark all fields as touched when form is invalid', () => {
      spyOn(component.forgotForm, 'markAllAsTouched');
      component.ForgotPassword();
      expect(component.forgotForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call forgetPassword service when form is valid', fakeAsync(() => {
      const validFormData = {
        email: 'test@example.com',
        updatedPassword: 'ValidPass123',
        otp: '1234'
      };

      component.forgotForm.patchValue(validFormData);
      
      const expectedData = {
        email: validFormData.email,
        password: validFormData.updatedPassword,
        otp: validFormData.otp
      };

      authService.forgetPassword.and.returnValue(of({ success: true }));

      component.ForgotPassword();
      tick();

      expect(authService.forgetPassword).toHaveBeenCalledWith(expectedData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'password update succesfully'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should handle error response', fakeAsync(() => {
      const validFormData = {
        email: 'test@example.com',
        updatedPassword: 'ValidPass123',
        otp: '12345'
      };

      component.forgotForm.patchValue(validFormData);

      const errorResponse = { error: { message: 'Error occurred' } };
      authService.forgetPassword.and.returnValue(throwError(() => errorResponse));

      component.ForgotPassword();
      tick();

      expect(component.errorMessage).toBe('Error occurred');
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should update loading state during API call', fakeAsync(() => {
      const validFormData = {
        email: 'test@example.com',
        updatedPassword: 'ValidPass123',
        otp: '12345'
      };

      component.forgotForm.patchValue(validFormData);
      authService.forgetPassword.and.returnValue(of({ success: true }));

      component.ForgotPassword();
      
      expect(authService.isLoading()).toBe(false);
      
      tick();
      
      expect(authService.isLoading()).toBe(false);
    }));
  });

  describe('ForgotPassword Method', () => {
    it('should mark all fields as touched when form is invalid', () => {
      spyOn(component.forgotForm, 'markAllAsTouched');
      component.ForgotPassword();
      expect(component.forgotForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call forgetPassword service when form is valid', fakeAsync(() => {
      const validFormData = {
        email: 'test@example.com',
        updatedPassword: 'ValidPass123',
        otp: '1234'
      };

      component.forgotForm.patchValue(validFormData);
      
      const expectedData = {
        email: validFormData.email,
        password: validFormData.updatedPassword,
        otp: validFormData.otp
      };

      authService.forgetPassword.and.returnValue(of({ success: true }));
      spyOn(authService.isLoading, 'update');

      component.ForgotPassword();
      tick();

      expect(authService.isLoading.update).toHaveBeenCalledWith(jasmine.any(Function));
      expect(authService.forgetPassword).toHaveBeenCalledWith(expectedData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'password update succesfully'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should handle error response', fakeAsync(() => {
      const validFormData = {
        email: 'test@example.com',
        updatedPassword: 'ValidPass123',
        otp: '12345'
      };

      component.forgotForm.patchValue(validFormData);

      const errorResponse = { error: { message: 'Error occurred' } };
      authService.forgetPassword.and.returnValue(throwError(() => errorResponse));
      spyOn(authService.isLoading, 'update');

      component.ForgotPassword();
      tick();

      expect(authService.isLoading.update).toHaveBeenCalledWith(jasmine.any(Function));
      expect(component.errorMessage).toBe('Error occurred');
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });
});
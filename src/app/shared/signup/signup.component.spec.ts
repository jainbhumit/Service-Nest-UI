import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { SignupData } from '../../models/auth.model';
import { Role } from '../../config';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signup', 'isLoading']);
    authServiceSpy.isLoading = { update: jasmine.createSpy() } as any;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SignupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the signup form with default values', () => {
      expect(component.signupForm).toBeDefined();
      expect(component.signupForm.get('username')?.value).toBe('');
      expect(component.signupForm.get('email')?.value).toBe('');
      expect(component.signupForm.get('password')?.value).toBe('');
      expect(component.signupForm.get('role')?.value).toBe('');
      expect(component.signupForm.get('address')?.value).toBe('');
      expect(component.signupForm.get('contact')?.value).toBe('');
      expect(component.signupForm.get('securityAnswer')?.value).toBe('');
    });
  });

  describe('onPasswordInput', () => {
    it('should display an error when the password is empty', () => {
      component.signupForm.get('password')?.setValue('');
      component.signupForm.get('password')?.markAsTouched();
      component.onPasswordInput();
      expect(component.errMessage).toBe('Password is required.');
    });

    it('should display an error when the password is less than 8 characters', () => {
      component.signupForm.get('password')?.setValue('Short1!');
      component.signupForm.get('password')?.markAsTouched();
      component.onPasswordInput();
      expect(component.errMessage).toBe('Password must be at least 8 characters long.');
    });

    it('should display an error when the password does not meet pattern requirements', () => {
      component.signupForm.get('password')?.setValue('password123');
      component.signupForm.get('password')?.markAsTouched();
      component.onPasswordInput();
      expect(component.errMessage).toBe('Password must contain an uppercase letter, a symbol, and a digit.');
    });

    it('should not display any error when the password meets all requirements', () => {
      component.signupForm.get('password')?.setValue('ValidPass123!');
      component.signupForm.get('password')?.markAsTouched();
      component.onPasswordInput();
      expect(component.errMessage).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should navigate to login on successful signup', () => {
      const mockSignupData: SignupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!',
        role: Role.householder,
        address: '123 Test St',
        contact: '1234567890',
        security_answer: 'test',
      };

      authService.signup.and.returnValue(of({ status: 'Success' }));
      component.signupForm.setValue({
        username: mockSignupData.name,
        email: mockSignupData.email,
        password: mockSignupData.password,
        role: mockSignupData.role,
        address: mockSignupData.address,
        contact: mockSignupData.contact,
        securityAnswer: mockSignupData.security_answer,
      });

      component.onSubmit();

      expect(authService.signup).toHaveBeenCalledWith(mockSignupData);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.errMessage).toBe('');
    });

    it('should display an error message on signup failure', () => {
      authService.signup.and.returnValue(
        throwError(() => ({ error: { message: 'Signup failed' } }))
      );

      component.signupForm.setValue({
        username: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!',
        role: Role.householder,
        address: '123 Test St',
        contact: '1234567890',
        securityAnswer: 'test',
      });

      component.onSubmit();

      expect(authService.signup).toHaveBeenCalled();
      expect(component.errMessage).toBe('Signup failed');
    });

    it('should mark all controls as touched if the form is invalid', () => {
      component.signupForm.setValue({
        username: '',
        email: '',
        password: '',
        role: '',
        address: '',
        contact: '',
        securityAnswer: '',
      });

      component.onSubmit();

      expect(component.signupForm.touched).toBeTrue();
      expect(component.signupForm.get('username')?.touched).toBeTrue();
      expect(component.signupForm.get('email')?.touched).toBeTrue();
    });
  });
});

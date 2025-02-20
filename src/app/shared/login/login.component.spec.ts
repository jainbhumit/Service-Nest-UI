import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Role, TestTokenAdmin, TestTokenHouseholder, TestTokenProvider } from '../../config';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;
  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj(AuthService, ['login', 'isLoading', 'userRole']);
    authServiceSpy.isLoading = { update: jasmine.createSpy() } as any;
    authServiceSpy.userRole = { set: jasmine.createSpy() } as any;
    routerSpy = jasmine.createSpyObj(Router, ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule,HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() =>{
    httpMock.verify();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form values correctly', () => {
    component.loginForm.setValue({
      email: 'test@gmail.com',
      password: 'Test@123',
    });

    expect(component.email?.value).toBe('test@gmail.com');
    expect(component.password?.value).toBe('Test@123');
  });

  it('should validate email and password fields correctly', () => {
    const emailControl = component.email!;
    const passwordControl = component.password!;

    emailControl.setValue('invalid-email');
    expect(emailControl.invalid).toBeTrue();

    emailControl.setValue('valid@gmail.com');
    expect(emailControl.valid).toBeTrue();

    passwordControl.setValue('short');
    expect(passwordControl.invalid).toBeTrue();

    passwordControl.setValue('Valid@123');
    expect(passwordControl.valid).toBeTrue();
  });

  it('should handle login failure and display error message', () => {
    component.loginForm.setValue({
      email: 'test@gmail.com',
      password: 'Test@123',
    });

    const mockError = {
      error: { message: 'Invalid credentials' },
    };

    authServiceSpy.login.and.returnValue(throwError(() => mockError));

    component.Login();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should mark form fields as touched when form is invalid', () => {
    component.loginForm.setValue({
      email: '',
      password: '',
    });

    spyOn(component.loginForm, 'markAllAsTouched').and.callThrough();

    component.Login();

    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.errorMessage).toBe('');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login successfully by householder',() => {
    const loginForm = component.loginForm;
    loginForm.controls['email'].setValue('test@gmail.com');
    loginForm.controls['password'].setValue('Test@123');
    
    authServiceSpy.login.and.returnValue(of({
      status:'success',
      message:'success',
      data:{
        token:TestTokenHouseholder
      }
    }))

    component.Login();
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      password: 'Test@123',
    });
    expect(authServiceSpy.userRole.set).toHaveBeenCalledWith(Role.householder);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/householder/home']);

  })

  it('should login successfully by serviceProvider',() => {
    const loginForm = component.loginForm;
    loginForm.controls['email'].setValue('test@gmail.com');
    loginForm.controls['password'].setValue('Test@123');
    
    authServiceSpy.login.and.returnValue(of({
      status:'success',
      message:'success',
      data:{
        token:TestTokenProvider
      }
    }))

    component.Login();
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      password: 'Test@123',
    });
    expect(authServiceSpy.userRole.set).toHaveBeenCalledWith(Role.serviceProvider);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/provider/home']);
  })

  it('should login successfully by admin',() => {
    const loginForm = component.loginForm;
    loginForm.controls['email'].setValue('test@gmail.com');
    loginForm.controls['password'].setValue('Test@123');
    
    authServiceSpy.login.and.returnValue(of({
      status:'success',
      message:'success',
      data:{
        token:TestTokenAdmin
      }
    }))

    component.Login();
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      password: 'Test@123',
    });
    expect(authServiceSpy.userRole.set).toHaveBeenCalledWith(Role.admin);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/home']);
  })
});

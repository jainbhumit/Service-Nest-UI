import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { UserProfile } from '../../models/user.model';
import { Role } from '../../config';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'Householder',
    address: 'Test Address',
    contact: '1234567890',
    security_answer: 'answer',
    is_active: true,
  };

  class MockAuthService{
    isLoading = signal<boolean>(false);
    userRole = signal<Role>(Role.householder)
  }
  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getProfile', 'updateProfile']);
    const authServiceSpy = new MockAuthService();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const locationSpy = jasmine.createSpyObj('Location', ['back']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule,RouterLink],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => 'mock-value',
              },
            },
          },
        },
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  beforeEach(() => {
    userService.getProfile.and.returnValue(of({
      status: 'Success',
      message: 'Profile fetched successfully',
      data: mockUserProfile
    }));
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user profile and set form values', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(userService.getProfile).toHaveBeenCalled();
      expect(component.user).toEqual(mockUserProfile);
      expect(component.updateForm.get('name')?.value).toBe(mockUserProfile.name);
      expect(component.updateForm.get('email')?.value).toBe(mockUserProfile.email);
      expect(component.updateForm.get('role')?.disabled).toBeTrue();
      expect(component.updateForm.get('email')?.disabled).toBeTrue();
    }));

    it('should handle error in profile fetch', fakeAsync(() => {
      const error = { error: { message: 'Error fetching profile' } };
      userService.getProfile.and.returnValue(throwError(() => error));
      
      spyOn(console, 'log');
      component.ngOnInit();
      tick();

      expect(console.log).toHaveBeenCalledWith('Error fetching profile');
    }));
  });

  describe('UpdateProfile', () => {
    it('should enable form controls and clear password', () => {
      component.UpdateProfile();

      expect(component.update).toBeTrue();
      expect(component.updateForm.get('email')?.enabled).toBeTrue();
      expect(component.updateForm.get('password')?.enabled).toBeTrue();
      expect(component.updateForm.get('password')?.value).toBe('');
      expect(component.updateForm.get('address')?.enabled).toBeTrue();
      expect(component.updateForm.get('contact')?.enabled).toBeTrue();
    });
  });

  describe('Update', () => {
    it('should update profile when form is valid', fakeAsync(() => {
      component.userRole = Role.householder;
      const updateFormData = {
        name:'John',
        email: 'new@example.com',
        password: 'NewPass@123!',
        address: 'New Address',
        contact: '9876543210',
        role: Role.householder
      };
      const updateData = {
        email: 'new@example.com',
        password: 'NewPass@123!',
        address: 'New Address',
        contact: '9876543210',
      }
      userService.updateProfile.and.returnValue(of({ status: 'Success', message: 'Updated successfully' }));
      
      component.UpdateProfile();
      component.updateForm.setValue(updateFormData);

      component.Update();

      expect(userService.updateProfile).toHaveBeenCalledWith(updateData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'User update successfully'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/householder/home']);
    }));

    it('should handle update error', fakeAsync(() => {
      const updateData = {
        email: 'new@example.com',
        password: 'NewPass@123!',
        address: 'New Address',
        contact: '9876543210'
      };

      component.updateForm.patchValue(updateData);
      component.updateForm.controls['email'].enable();
      component.updateForm.controls['password'].enable();
      component.updateForm.controls['password'].enable();
      component.updateForm.controls['address'].enable();
      component.updateForm.controls['contact'].enable();
      userService.updateProfile.and.returnValue(throwError(() => ({ error: { message: 'Error updating user' } })));

      component.Update();
      tick();

      expect(component.errorMessage).toBe('email id already exist');
    }));
  });

  describe('Password Validation', () => {
    beforeEach(()=> {
      component.update = true;
    
    })
    it('should show error when password is empty', () => {
      const passwordControl = component.updateForm.get('password');
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();
      passwordControl?.enable();
      
      component.onPasswordInput();
      expect(component.errorMessage).toBe('Password is required.');
    });
  
    it('should show error when password is less than 8 characters', () => {
      const passwordControl = component.updateForm.get('password');
      passwordControl?.setValue('Short1!');
      passwordControl?.markAsTouched();
      passwordControl?.enable();
      
      component.onPasswordInput();
      expect(component.errorMessage).toBe('Password must be at least 8 characters long.');
    });
  
    it('should show error when password does not meet pattern requirements', () => {
      const passwordControl = component.updateForm.get('password');
      passwordControl?.setValue('password123');
      passwordControl?.markAsTouched();
      passwordControl?.enable();

      component.onPasswordInput();
      expect(component.errorMessage).toBe('Password must contain an uppercase letter, a symbol, and a digit.');
    });
  
    it('should not show any error when password meets all requirements', () => {
      const passwordControl = component.updateForm.get('password');
      passwordControl?.setValue('ValidPass123!');
      passwordControl?.markAsTouched();
      passwordControl?.enable();

      component.onPasswordInput();
      expect(component.errorMessage).toBe('');
    });
  
    it('should mark password control as invalid when errors exist', () => {
      const passwordControl = component.updateForm.get('password');
      passwordControl?.setValue('Short1!');
      passwordControl?.markAsTouched();
      passwordControl?.enable();

      expect(passwordControl?.invalid).toBeTrue();
    });
  
    it('should mark password control as valid when no errors exist', () => {
      const passwordControl = component.updateForm.get('password');
      passwordControl?.setValue('ValidPass123!');
      passwordControl?.markAsTouched();
      passwordControl?.enable();

      expect(passwordControl?.valid).toBeTrue();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when onBack is called', () => {
      component.onBack();
      expect(location.back).toHaveBeenCalled();
    });

    it('should return correct router link based on user role', () => {
      expect(component.getRouterLink('home')).toBe('/householder/home');

      component.userRole = Role.serviceProvider as Role
      expect(component.getRouterLink('home')).toBe('/provider/home');
      
      component.userRole = Role.admin as Role
      expect(component.getRouterLink('home')).toBe('/admin/home');
    });
  });

  describe('Form Validation', () => {
    it('should validate contact number format', () => {
      const contact = component.updateForm.get('contact');
      
      contact?.enable();
      contact?.setValue('123');
      expect(contact?.errors?.['pattern']).toBeTruthy();

      contact?.enable();
      contact?.setValue('1234567890');
      expect(contact?.errors).toBeNull();
    });

    it('should validate email format', () => {
      const email = component.updateForm.get('email');
      email?.enable();
      email?.setValue('invalid-email');
      expect(email?.errors?.['email']).toBeTruthy();
      
      email?.enable();
      email?.setValue('valid@email.com');
      expect(email?.errors).toBeNull();
    });
  });
});
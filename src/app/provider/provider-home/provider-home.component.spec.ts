import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProviderHomeComponent } from './provider-home.component';
import { UserService } from './../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ServiceCategory } from '../../models/service.model';
import { signal } from '@angular/core';

describe('ProviderHomeComponent', () => {
  let component: ProviderHomeComponent;
  let fixture: ComponentFixture<ProviderHomeComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockCategories: ServiceCategory[] = [
    { id: '1', name: 'Plumbing', description: 'Plumbing services' },
    { id: '2', name: 'Electrical', description: 'Electrical services' },
    { id: '3', name: 'Carpentry', description: 'Carpentry services' }
  ];

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['fetchCategories'],{
      currentService : signal('')
    });
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ProviderHomeComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderHomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch categories successfully', () => {
      userService.fetchCategories.and.returnValue(
        of({ status: 'Success',message:'success', data: mockCategories })
      );

      component.ngOnInit();

      expect(component.categories).toEqual(mockCategories);
      expect(component.filteredServices).toEqual(mockCategories);
    });

    it('should handle error when fetching categories', () => {
      const error = new Error('Failed to fetch categories');
      userService.fetchCategories.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error fetching categories:', error);
    });
  });

  describe('filterServices', () => {
    beforeEach(() => {
      component.categories = mockCategories;
    });

    it('should filter services based on search term', () => {
      component.searchTerm = 'plum';
      component.filterServices();

      expect(component.filteredServices.length).toBe(1);
      expect(component.filteredServices[0].name).toBe('Plumbing');
    });

    it('should show all services when search term is empty', () => {
      component.searchTerm = '';
      component.filterServices();

      expect(component.filteredServices).toEqual(mockCategories);
    });

    it('should be case insensitive', () => {
      component.searchTerm = 'PLUM';
      component.filterServices();

      expect(component.filteredServices.length).toBe(1);
      expect(component.filteredServices[0].name).toBe('Plumbing');
    });

    it('should return empty array when no matches found', () => {
      component.searchTerm = 'xyz';
      component.filterServices();

      expect(component.filteredServices.length).toBe(0);
    });
  });

  describe('getServiceImg', () => {
    it('should return image URL for a service', () => {
      const serviceName = 'Plumbing';
      const imageUrl = component.getServiceImg(serviceName);
      
      expect(typeof imageUrl).toBe('string');
      expect(imageUrl.length).toBeGreaterThan(0);
    });
  });

  describe('onServiceClick', () => {
    it('should set current service and navigate to category page', () => {
      const selectedService = mockCategories[0];
      
      component.onServiceClick(selectedService);
      expect(userService.currentService()).toEqual(selectedService);
      expect(router.navigate).toHaveBeenCalledWith(['provider/category']);
    });
  });

  describe('LogOut', () => {
    it('should call logout and navigate to home', () => {
      component.LogOut();

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });
});
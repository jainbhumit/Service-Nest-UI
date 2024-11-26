import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProviderReviewComponent } from './provider-review.component';
import { ProviderService } from '../../services/provider.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ProviderReview, ServiceCategory } from '../../models/service.model';

describe('ProviderReviewComponent', () => {
  let component: ProviderReviewComponent;
  let fixture: ComponentFixture<ProviderReviewComponent>;
  let providerService: jasmine.SpyObj<ProviderService>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockCategories = {
    status: 'Success',
    message:'success',
    data: [
      { id: '1', name: 'Plumbing' },
      { id: '2', name: 'Electrical' }
    ] as ServiceCategory[]
  };

  const mockReviews: ProviderReview[] = [
    {
      id: '1',
      rating: 4,
      comments: 'Great service',
    },
    {
      id: '2',
      rating: 5,
      comments: 'Excellent work',
    }
  ] as ProviderReview[];

  beforeEach(async () => {
    const providerServiceSpy = jasmine.createSpyObj('ProviderService', ['getReview']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['fetchCategories']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isLoading: { update: jasmine.createSpy('update') }
    });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProviderReviewComponent],
      providers: [
        { provide: ProviderService, useValue: providerServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        DatePipe,
        MessageService
      ]
    }).compileComponents();

    providerService = TestBed.inject(ProviderService) as jasmine.SpyObj<ProviderService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderReviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      userService.fetchCategories.and.returnValue(of(mockCategories));
      providerService.getReview.and.returnValue(of({ status: 'Success',message:'success', data: mockReviews }));
    });

    it('should fetch categories and reviews on initialization', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(userService.fetchCategories).toHaveBeenCalled();
      expect(providerService.getReview).toHaveBeenCalled();
      expect(component.categories.size).toBe(2);
      expect(component.categories.get('1')).toBe('Plumbing');
      expect(authService.isLoading.update).toHaveBeenCalledTimes(4); // Called twice each for categories and reviews
    }));

    it('should handle category fetch error', fakeAsync(() => {
      const error = { error: { message: 'Failed to fetch categories' } };
      userService.fetchCategories.and.returnValue(throwError(() => error));
      spyOn(console, 'log');

      component.ngOnInit();
      tick();

      expect(console.log).toHaveBeenCalledWith(error.error.message);
    }));
  });

  describe('loadReview', () => {
    it('should load reviews successfully', fakeAsync(() => {
      providerService.getReview.and.returnValue(
        of({ status: 'Success',message:'success', data: mockReviews })
      );

      component.loadReview();
      tick();

      expect(component.filteredReview).toEqual(mockReviews);
      expect(component.apiResponseEnd).toBe(true);
      expect(authService.isLoading.update).toHaveBeenCalledTimes(2);
    }));

    it('should handle empty reviews response', fakeAsync(() => {
      providerService.getReview.and.returnValue(
        throwError(() => ({ error: { status:'fail',message: 'no reviews found' } }))
      )
      component.loadReview();
      tick();

      expect(component.filteredReview).toEqual([]);
    }));

    it('should handle error response with "no reviews found"', fakeAsync(() => {
      providerService.getReview.and.returnValue(
        throwError(() => ({ error: { message: 'no reviews found' } }))
      );
      spyOn(console, 'log');

      component.loadReview();
      tick();

      expect(component.filteredReview).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('no reviews found');
    }));
  });

  describe('onPageChange', () => {
    it('should update currentPage and reload reviews', () => {
      const newPage = 2;
      spyOn(component, 'loadReview');

      component.onPageChange(newPage);

      expect(component.currentPage).toBe(newPage);
      expect(component.apiResponseEnd).toBe(false);
      expect(component.loadReview).toHaveBeenCalled();
    });
  });

  describe('onBack', () => {
    it('should navigate to provider home', () => {
      spyOn(router, 'navigate');

      component.onBack();

      expect(router.navigate).toHaveBeenCalledWith(['/provider/home']);
    });
  });

  describe('onStatusChange', () => {
    it('should call loadReview', () => {
      spyOn(component, 'loadReview');

      component.onStatusChange();

      expect(component.loadReview).toHaveBeenCalled();
    });
  });

  describe('onRefresh', () => {
    it('should call loadReview', () => {
      spyOn(component, 'loadReview');

      component.onRefresh();

      expect(component.loadReview).toHaveBeenCalled();
    });
  });
});
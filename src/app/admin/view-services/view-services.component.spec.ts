import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';

import { ServicesComponent } from './view-services.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import {
  ProviderServiceDetail,
  ServiceCategory,
} from '../../models/service.model';
import { signal } from '@angular/core';
class MockAuthService {
  // Mock the signal with `update` method
  isLoading = signal(false);  // Default value is false

  // This is the key method that should be called in the component
  update(value: boolean) {
    this.isLoading.update(() => value);  // Update the signal with the new value
  }
}
describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: MockAuthService;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'fetchCategories',
    ]);
    authServiceSpy = new MockAuthService();
    adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'fetchServices',
      'deactivateAccount',
    ]);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [ServicesComponent],
      imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch categories on init', () => {
    const categoriesMock = [
      {
        id: '1',
        name: 'Cleaning',
        description: 'test',
      },
      {
        id: '2',
        name: 'Plumbing',
        description: 'test',
      },
    ];

    userServiceSpy.fetchCategories.and.returnValue(
      of({ status: 'success', message: 'success', data: categoriesMock })
    );
    adminServiceSpy.fetchServices.and.returnValue(of({ status:'sucess',message: 'sucess', data: [] }));
    component.ngOnInit();

    expect(userServiceSpy.fetchCategories).toHaveBeenCalled();
    expect(component.categories.size).toBe(2);
    expect(component.categories.get('1')).toBe('Cleaning');
  });

  it('should load services on init', () => {
    const servicesMock:ProviderServiceDetail[] = [
      {
        id: '1',
        category: 'Cleaning',
        name: 'Service 1',
        description: 'test',
        price: 500,
        provider_id: 'provider 1',
        category_id: 'category 1',
        avg_rating: 5,
        rating_count: '50',
      },
      {
        id: '2',
        name: 'Plumbing',
        description: 'test',
        price: 500,
        provider_id: 'provider 2',
        category: 'Plumbing',
        category_id: 'category 2',
        avg_rating: 5,
        rating_count: '50',
      }
    ];
    adminServiceSpy.fetchServices.and.returnValue(
      of({ status: 'success', message: 'success', data: servicesMock })
    );

    component.loadServices();

    expect(adminServiceSpy.fetchServices).toHaveBeenCalledWith(
      component.itemsPerPage,
      component.currentPage
    );
    expect(component.paginatedServices.length).toBe(2);
    expect(component.apiResponseEnd).toBe(true);
  });

  it('should apply status filter correctly', () => {
    component.paginatedServices = [
      {
        id: '1',
        category: 'Cleaning',
        name: 'Service 1',
        price: 500,
        provider_id: 'provider 1',
        category_id: 'category 1',
        avg_rating: 5,
        rating_count: '50',
        description: 'test'
      },
      {
        id: '2',
        category: 'Plumbing',
        name: 'Service 2',
        description: 'test',
        price: 500,
        provider_id: 'provider 2',
        category_id: 'category 2',
        avg_rating: 5,
        rating_count: '50',
      },
    ];
    component.selectedStatus = 'Cleaning';

    component.applyStatusFilter();

    expect(component.filteredServices.length).toBe(1);
    expect(component.filteredServices[0].category).toBe('Cleaning');
  });

  it('should handle pagination', () => {
    spyOn(component, 'loadServices');
    component.onPageChange(2);

    expect(component.currentPage).toBe(2);
    expect(component.loadServices).toHaveBeenCalled();
  });

  it('should deactivate account', () => {
    const providerId = '123';
    const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
    adminServiceSpy.deactivateAccount.and.returnValue(
      of({ status:'sucess',message: 'Account deactivated' })
    );
    messageServiceSpy.add.and.callThrough()
    component.deactivateAccount(providerId);

    expect(dialogSpy).toHaveBeenCalled();
    expect(adminServiceSpy.deactivateAccount).toHaveBeenCalledWith(providerId);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Account deactivated',
    });
  });

  it('should handle deactivate account error', () => {
    const providerId = '123';
    const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
    adminServiceSpy.deactivateAccount.and.returnValue(
      throwError({ error: { message: 'Error deactivating account' } })
    );

    component.deactivateAccount(providerId);

    expect(dialogSpy).toHaveBeenCalled();
    expect(adminServiceSpy.deactivateAccount).toHaveBeenCalledWith(providerId);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error deactivating account',
    });
  });
});

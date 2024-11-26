import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HouseholderHomeComponent } from './householder-home.component';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { HouseholderService } from '../../services/householder.service';
import { AdminService } from '../../services/admin.service';
import { MessageService } from 'primeng/api';
import { ServiceCategory } from '../../models/service.model';
import { signal } from '@angular/core';
import { Role } from '../../config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

class MockAuthService {
  userRole = signal<Role>(Role.householder);
  isLoading = signal<boolean>(false)

  logout(){}
}
describe('HouseholderHomeComponent', () => {
  let component: HouseholderHomeComponent;
  let fixture: ComponentFixture<HouseholderHomeComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockAuthService: MockAuthService;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockAuthService = new MockAuthService();
    mockUserService = jasmine.createSpyObj('UserService', ['fetchCategories'], {
      currentService: { set: jasmine.createSpy('set') },
    });
    mockAdminService = jasmine.createSpyObj('AdminService', ['deleteService']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [HouseholderHomeComponent],
      imports:[HttpClientTestingModule,HttpClientModule,RouterLink,FormsModule],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
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
      ],
    }).compileComponents();
    const categories: ServiceCategory[] = [
      { id: '1', name: 'Plumbing', description: 'Plumbing services' },
      { id: '2', name: 'Cleaning', description: 'Cleaning services' },
    ];
    mockUserService.fetchCategories.and.returnValue(of({ status: 'Success',message:'fetch successfully', data: categories }));

    fixture = TestBed.createComponent(HouseholderHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch categories on initialization', () => {
    const categories: ServiceCategory[] = [
      { id: '1', name: 'Plumbing', description: 'Plumbing services' },
      { id: '2', name: 'Cleaning', description: 'Cleaning services' },
    ];
    mockUserService.fetchCategories.and.returnValue(of({ status: 'Success',message:'fetch successfully', data: categories }));

    component.ngOnInit();

    expect(mockUserService.fetchCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(categories);
    expect(component.filteredServices).toEqual(categories);
  });

  it('should filter services based on the search term', () => {
    component.categories = [
      { id: '1', name: 'Plumbing', description: 'Plumbing services' },
      { id: '2', name: 'Cleaning', description: 'Cleaning services' },
    ];
    component.searchTerm = 'cleaning';

    component.filterServices();

    expect(component.filteredServices).toEqual([
      { id: '2', name: 'Cleaning', description: 'Cleaning services' },
    ]);
  });

  it('should navigate to the correct route on service click based on role', () => {
    const service: ServiceCategory = { id: '1', name: 'Plumbing', description: 'Plumbing services' };
    mockAuthService.userRole.set(Role.householder);

    component.onServiceClick(service);

    expect(mockUserService.currentService.set).toHaveBeenCalledWith(service);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['householder/category']);
  });

  it('should open the confirm dialog and delete category on confirmation', () => {
    const dialogRefMock = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(dialogRefMock as any);
    mockAdminService.deleteService.and.returnValue(of({ status:'success',message: 'Service deleted successfully' }));
    const categoryId = '1';
    const categories: ServiceCategory[] = [
      { id: '1', name: 'Plumbing', description: 'Plumbing services' },
      { id: '2', name: 'Cleaning', description: 'Cleaning services' },
    ];
    component.filteredServices = categories;
    mockUserService.fetchCategories.and.returnValue(of({ status: 'Success',message:'fetch successfully', data: [categories[1]] }));

    component.deleteCategory(categoryId);
    
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockAdminService.deleteService).toHaveBeenCalledWith(categoryId);
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Service delete successfully',
    });
    console.log(component.filterServices);
    expect(component.filteredServices).toEqual([
      { id: '2', name: 'Cleaning', description: 'Cleaning services' },
    ]);
  });

  it('should display error message if delete category fails', () => {
    const dialogRefMock = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(dialogRefMock as any);
    mockAdminService.deleteService.and.returnValue(throwError({ error: { message: 'Error deleting category' } }));

    component.deleteCategory('1');

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error deleting category',
    });
  });

  it('should open add category dialog and fetch categories on dialog close with response', () => {
    const dialogRefMock = { afterClosed: () => of(true) };
    mockDialog.open.and.returnValue(dialogRefMock as any);
    spyOn(component, 'fetchCategories');

    component.addCategory();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(component.fetchCategories).toHaveBeenCalled();
  });

  it('should navigate to login on logout', () => {
    spyOn(mockAuthService,'logout').and.callThrough();
    component.LogOut();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should return correct router link based on role', () => {
    component.role = Role.householder;
    fixture.detectChanges();
    expect(component.getRouterLink('dashboard')).toEqual('/householder/dashboard');
    fixture.detectChanges();
    component.role=Role.admin
    expect(component.getRouterLink('dashboard')).toEqual('/admin/dashboard');
  });
});

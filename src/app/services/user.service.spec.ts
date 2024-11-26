import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { BaseUrl, ApiUrlWithUser } from '../config';
import { UpdateProfile, UserProfile } from '../models/user.model';
import { ServiceCategory } from '../models/service.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${BaseUrl}${ApiUrlWithUser}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize currentService signal with empty values', () => {
    const currentService = service.currentService();
    expect(currentService).toEqual({
      name: '',
      description: '',
      id: ''
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', () => {
      const mockResponse = {
        status: 'success',
        message: 'Profile fetched successfully',
        data: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        } as UserProfile
      };

      service.getProfile().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', () => {
      const mockUpdateData = {
        email: 'john.updated@example.com',
        address:'test address'
      } as UpdateProfile;

      const mockResponse = {
        status: 'success',
        message: 'Profile updated successfully'
      };

      service.updateProfile(mockUpdateData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateData);
      req.flush(mockResponse);
    });
  });

  describe('fetchCategories', () => {
    it('should fetch service categories', () => {
      const mockCategories: ServiceCategory[] = [
        { id: '1', name: 'Category 1', description: 'Description 1' },
        { id: '2', name: 'Category 2', description: 'Description 2' }
      ];

      const mockResponse = {
        status: 'success',
        message: 'Categories fetched successfully',
        data: mockCategories
      };

      service.fetchCategories().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  // Error handling tests
  describe('error handling', () => {
    it('should handle getProfile error', () => {
      const errorResponse = {
        status: 'error',
        message: 'Failed to fetch profile'
      };

      service.getProfile().subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle updateProfile error', () => {
      const mockUpdateData = {
        email: 'john.updated@example.com'
      } as UpdateProfile;

      service.updateProfile(mockUpdateData).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      req.flush(
        { status: 'error', message: 'Failed to update profile' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle fetchCategories error', () => {
      service.fetchCategories().subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      req.flush(
        { status: 'error', message: 'Failed to fetch categories' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HouseholderService } from './householder.service';
import { BaseUrl, ApiUrlWithUser } from '../config';
import { of } from 'rxjs';
import { RequestBody, Review } from '../models/service.model';

describe('HouseholderService', () => {
  let service: HouseholderService;
  let httpMock: HttpTestingController;

  const apiUrl = `${BaseUrl}${ApiUrlWithUser}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HouseholderService],
    });

    service = TestBed.inject(HouseholderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getServiceByCategory', () => {
    it('should return services by category', () => {
      const mockResponse = {
        status: 'success',
        message: 'Services fetched successfully',
        data: [{ id: '1', name: 'Service 1' }, { id: '2', name: 'Service 2' }],
      };

      service.getServiceByCategory('category1').subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.data.length).toBe(2);
        expect(response.data[0].name).toBe('Service 1');
      });

      const req = httpMock.expectOne(`${apiUrl}/services?category=category1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('requestService', () => {
    it('should request a service', () => {
      const requestData:RequestBody = {
        service_name: 'test',
        category: 'test',
        description: 'testDesc',
        scheduled_time: '2025-02-1 15:40'
      };
      const mockResponse = {
        status: 'success',
        message: 'Request successful',
        data: { request_id: 'abc123' },
      };

      service.requestService(requestData).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.data.request_id).toBe('abc123');
      });

      const req = httpMock.expectOne(`${apiUrl}/services/request`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestData);
      req.flush(mockResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockResponse = {
        status: 'success',
        message: 'Profile fetched successfully',
        data: { id: '123', name: 'John Doe' },
      };

      service.getProfile().subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.data.name).toBe('John Doe');
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('fetchBookings', () => {
    it('should return bookings', () => {
      const mockResponse = {
        status: 'success',
        message: 'Bookings fetched successfully',
        data: [{ id: '1', service_id: '1', status: 'approved' }],
      };

      const itemsPerPage = 10;
      const currentPage = 1;
      const selectedStatus = 'approved';

      service.fetchBookings(itemsPerPage, currentPage, selectedStatus).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.data.length).toBe(1);
        expect(response.data[0].status).toBe('approved');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/bookings?limit=${itemsPerPage}&offset=0&status=${selectedStatus}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('cancelServiceRequest', () => {
    it('should cancel a service request', () => {
      const requestId = 'abc123';
      const mockResponse = {
        status: 'success',
        message: 'Request cancelled successfully',
      };

      service.cancelServiceRequest(requestId).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.message).toBe('Request cancelled successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/services/request/${requestId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockResponse);
    });
  });

  describe('updateServiceRequest', () => {
    it('should update a service request', () => {
      const updateData = { id: 'abc123', scheduled_time: '2024-12-01T10:00:00' };
      const mockResponse = {
        status: 'success',
        message: 'Request updated successfully',
      };

      service.updateServiceRequest(updateData).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.message).toBe('Request updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/services/request`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('approveRequest', () => {
    it('should approve a service request', () => {
      const body = { request_id: 'abc123', provider_id: '123' };
      const mockResponse = {
        status: 'success',
        message: 'Request approved successfully',
      };

      service.approveRequest(body).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.message).toBe('Request approved successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/services/request/approve`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('viewApprovedRequest', () => {
    it('should view approved requests', () => {
      const mockResponse = {
        status: 'success',
        message: 'Approved requests fetched successfully',
        data: [{ request_id: 'abc123', provider_id: '1' }],
      };

      const itemsPerPage = 10;
      const currentPage = 1;
      const selectedStatus = 'approved';

      service.viewApprovedRequest(itemsPerPage, currentPage, selectedStatus).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.data.length).toBe(1);
        expect(response.data[0].request_id).toBe('abc123');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/service/request/approved?limit=${itemsPerPage}&offset=0&order=${selectedStatus}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('addReview', () => {
    it('should add a review', () => {
      const review:Review = { service_id: '1', rating: 5, review_text: 'Great service',provider_id:'provider'};
      const mockResponse = {
        status: 'success',
        message: 'Review added successfully',
      };

      service.addReview(review).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(response.message).toBe('Review added successfully');
      });

      const req = httpMock.expectOne(`${BaseUrl}/api/householder/review`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(review);
      req.flush(mockResponse);
    });
  });
});

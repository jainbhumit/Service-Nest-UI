import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Booking, ApproveRequests, ProviderServiceDetail, RequestBody } from '../models/service.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should delete a service', () => {
    const serviceId = '123';
    const mockResponse = { status: 'success', message: 'Service deleted successfully' };

    service.deleteService(serviceId).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.message).toBe('Service deleted successfully');
    });

    const req = httpMock.expectOne(`${service.apiUrl}/service/${serviceId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should add a service', () => {
    const mockRequestBody = { category_name: 'Test Service', description: 'Test Description' };
    const mockResponse = { status: 'success', message: 'Service added successfully' };

    service.addService(mockRequestBody).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.message).toBe('Service added successfully');
    });

    const req = httpMock.expectOne(`${service.apiUrl}/service`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequestBody);
    req.flush(mockResponse);
  });

  it('should get user by email', () => {
    const email = 'test@example.com';
    const mockResponse = { status: 'success', message: 'User found', data: { email:email } };

    service.getUser(email).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.data.email).toBe(email);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/users/${email}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should request service', () => {
    const mockRequestBody: RequestBody = {
      service_name: 'cleaning',
      category: 'Cleaning',
      description: 'test',
      scheduled_time: 'test'
    };
    const mockResponse = { status: 'success', message: 'Request successful', data: { request_id: '1' } };
    service.userId = 'testUserId';

    service.requestService(mockRequestBody).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.data.request_id).toBe('1');
    });

    const req = httpMock.expectOne((req) =>
      req.method === 'POST' &&
      req.url === `${service.apiUserUrl}/services/request` &&
      req.params.get('user_id') === 'testUserId'
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should fetch bookings with parameters', () => {
    const mockResponse = { status: 'success', message: 'Bookings fetched successfully', data: [] as Booking[] };
    const itemsPerPage = 10;
    const currentPage = 1;
    const selectedStatus = 'accepted';

    service.fetchBookings(itemsPerPage, currentPage, selectedStatus).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.data).toEqual([]);
    });

    const req = httpMock.expectOne(req => req.method === 'GET' && req.url === `${service.apiUserUrl}/bookings`);
    expect(req.request.params.has('limit')).toBe(true);
    expect(req.request.params.has('offset')).toBe(true);
    expect(req.request.params.has('status')).toBe(true);
    req.flush(mockResponse);
  });

  it('should cancel service request', () => {
    const requestId = '123';
    const mockResponse = { status: 'success', message: 'Request cancelled successfully' };
    service.userId = 'testUserId';
    service.cancelServiceRequest(requestId).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.message).toBe('Request cancelled successfully');
    });

    const req = httpMock.expectOne((req) =>
      req.method === 'PATCH' &&
      req.url === `${service.apiUserUrl}/services/request/${requestId}` &&
      req.params.get('user_id') === 'testUserId'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should update service request', () => {
    const mockRequestBody = { id: '1', scheduled_time: '2024-12-01' };
    const mockResponse = { status: 'success', message: 'Request updated successfully' };
    service.userId = 'testUserId';
    service.updateServiceRequest(mockRequestBody).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.message).toBe('Request updated successfully');
    });

    const req = httpMock.expectOne((req) =>
      req.method === 'PUT' &&
      req.url === `${service.apiUserUrl}/services/request` &&
      req.params.get('user_id') === 'testUserId'
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should approve service request', () => {
    const mockRequestBody = { request_id: '1', provider_id: '123' };
    const mockResponse = { status: 'success', message: 'Request approved successfully' };
  
    service.userId = 'testUserId';
    service.approveRequest(mockRequestBody).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.message).toBe('Request approved successfully');
    });
  
    const req = httpMock.expectOne((req) =>
      req.method === 'PUT' &&
      req.url === `${service.apiUserUrl}/services/request/approve` &&
      req.params.get('user_id') === 'testUserId'
    );
  
    expect(req.request.body).toEqual(mockRequestBody);
    req.flush(mockResponse);
  });

  it('should fetch services with pagination', () => {
    const mockResponse = { status: 'success', message: 'Services fetched successfully', data: [] as ProviderServiceDetail[] };
    const itemsPerPage = 10;
    const currentPage = 1;

    service.fetchServices(itemsPerPage, currentPage).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.data).toEqual([]);
    });

    const req = httpMock.expectOne(req => req.method === 'GET' && req.url === `${service.apiUserUrl}/services`);
    expect(req.request.params.has('limit')).toBe(true);
    expect(req.request.params.has('offset')).toBe(true);
    req.flush(mockResponse);
  });

  it('should deactivate a provider account', () => {
    const providerId = '123';
    const mockResponse = { status: 'success', message: 'Account deactivated successfully' };

    service.deactivateAccount(providerId).subscribe(response => {
      expect(response.status).toBe('success');
      expect(response.message).toBe('Account deactivated successfully');
    });

    const req = httpMock.expectOne(`${service.apiUrl}/deactivate/${providerId}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });
});

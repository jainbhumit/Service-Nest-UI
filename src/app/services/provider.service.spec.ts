import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProviderService } from './provider.service';
import {
  AddService,
  ProviderApproveRequest,
  ProviderReview,
  ProviderServiceDetail,
  ProviderViewRequest,
} from '../models/service.model';
import { ApiUrlWithProvider, ApiUrlWithUser, BaseUrl } from '../config';

describe('ProviderService', () => {
  let service: ProviderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProviderService],
    });
    service = TestBed.inject(ProviderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch provider services', () => {
    const mockResponse = {
      status: 'success',
      message: 'Fetched successfully',
      data: [
        { category_id: '1', name: 'Service 1' },
        { category_id: '2', name: 'Service 2' },
      ] as ProviderServiceDetail[],
    };

    service.getProviderService().subscribe((response) => {
      expect(response.data.length).toBe(2);
      expect(response.data[0].name).toBe('Service 1');
    });

    const req = httpMock.expectOne(`${BaseUrl}${ApiUrlWithProvider}/service`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add a new service', () => {
    const body: AddService = {
      name: 'Test Service', category: 'Test',
      description: 'test',
      price: 0
    };
    const mockResponse = {
      status: 'success',
      message: 'Added successfully',
      data: { service_id: '123' },
    };

    service.addService(body).subscribe((response) => {
      expect(response.data.service_id).toBe('123');
    });

    const req = httpMock.expectOne(`${BaseUrl}${ApiUrlWithProvider}/service`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('should update a service', () => {
    const body: AddService = {
      name: 'Updated Service', category: 'Updated',
      description: '',
      price: 0
    };
    const serviceId = '123';
    const mockResponse = { status: 'success', message: 'Updated successfully' };

    service.updateService(body, serviceId).subscribe((response) => {
      expect(response.message).toBe('Updated successfully');
    });

    const req = httpMock.expectOne(`${BaseUrl}${ApiUrlWithProvider}/service/${serviceId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('should delete a service', () => {
    const serviceId = '123';
    const mockResponse = { status: 'success', message: 'Deleted successfully' };

    service.deleteService(serviceId).subscribe((response) => {
      expect(response.message).toBe('Deleted successfully');
    });

    const req = httpMock.expectOne(`${BaseUrl}${ApiUrlWithProvider}/service/${serviceId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should fetch service requests', () => {
    const mockResponse = {
      status: 'success',
      message: 'Requests fetched',
      data: [{ request_id: '1', service_id: 'Request 1' }] as ProviderViewRequest[],
    };

    service.viewServiceRequest(10, 1, 'test').subscribe((response) => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].request_id).toBe('1');
    });

    const req = httpMock.expectOne(
      `${BaseUrl}${ApiUrlWithProvider}/service/requests?limit=10&offset=0&serviceId=test`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should accept a service request', () => {
    const body = { request_id: '1', price: '100' };
    const mockResponse = { status: 'success', message: 'Accepted successfully' };

    service.acceptServiceRequest(body).subscribe((response) => {
      expect(response.message).toBe('Accepted successfully');
    });

    const req = httpMock.expectOne(`${BaseUrl}${ApiUrlWithProvider}/service/requests`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockResponse);
  });

  it('should fetch approved requests', () => {
    const mockResponse = {
      status: 'success',
      message: 'Approved requests fetched',
      data: [{ request_id: '1', householder_address: 'Address' }] as ProviderApproveRequest[],
    };

    service.viewApprovedRequest(10, 1, 'approved').subscribe((response) => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].request_id).toBe('1');
    });

    const req = httpMock.expectOne(
      `${BaseUrl}${ApiUrlWithUser}/service/request/approved?limit=10&offset=0&order=approved`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch provider reviews', () => {
    const mockResponse = {
      status: 'success',
      message: 'Reviews fetched',
      data: [{ id: '1', comments: 'Good service' }] as ProviderReview[],
    };

    service.getReview(10, 1, 'test').subscribe((response) => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].id).toBe('1');
    });

    const req = httpMock.expectOne(
      `${BaseUrl}${ApiUrlWithProvider}/reviews?limit=10&offset=0&serviceId=test`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});

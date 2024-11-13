import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  ApproveRequests,
  Booking,
  RequestBody,
  Review,
  Service,
  ServiceCategory,
} from '../models/service.model';
import { ApiUrlWithUser, BaseUrl } from '../config';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class HouseholderService {
  currentAcceptRequestDetail = signal<{
    request_id: string;
    provider_details: Booking['provider_details'][];
  }>({
    request_id: '',
    provider_details: [],
  });
  private apiUrl = `${BaseUrl}${ApiUrlWithUser}`;
  private bookings: Booking[] | null = null;
  constructor(private http: HttpClient) {}

  getServiceByCategory(
    categoryName: string
  ): Observable<{ status: string; message: string; data: Service[] }> {
    console.log(`in service category name is : ${categoryName}`);
    return this.http.get<{ status: string; message: string; data: Service[] }>(
      `${this.apiUrl}/services?category=${categoryName}`
    );
  }

  requestService(data: RequestBody): Observable<{
    status: string;
    message: string;
    data: { request_id: string };
  }> {
    return this.http.post<{
      status: string;
      message: string;
      data: { request_id: string };
    }>(`${this.apiUrl}/services/request`, data);
  }

  getProfile(): Observable<{
    status: string;
    message: string;
    data: UserProfile;
  }> {
    return this.http.get<{
      status: string;
      message: string;
      data: UserProfile;
    }>(`${this.apiUrl}/profile`);
  }

  fetchBookings(
    itemsPerPage: number,
    currentPage: number,
    selectedStatus: string
  ): Observable<{
    status: string;
    message: string;
    data: Booking[];
  }> {
    let params = new HttpParams()
      .set('limit', itemsPerPage)
      .set('offset', (currentPage - 1) * itemsPerPage);

    if (selectedStatus) {
      params = params.set('status', selectedStatus);
    }

    return this.http
      .get<{
        status: string;
        message: string;
        data: Booking[];
      }>(`${this.apiUrl}/bookings`, { params })
      .pipe(
        tap((response) => {
          this.bookings = response.data;
        })
      );
  }

  getStoredBookings(): Booking[] | null {
    return this.bookings;
  }

  cancelServiceRequest(requestId: string): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.patch<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/services/request/${requestId}`, null);
  }

  updateServiceRequest(data: {
    id: string;
    scheduled_time: string;
  }): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.put<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/services/request`, data);
  }

  approveRequest(body: {
    request_id: string;
    provider_id: string;
  }): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.put<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/services/request/approve`, body);
  }

  viewApprovedRequest(
    itemsPerPage: number,
    currentPage: number,
    selectedStatus: string
  ): Observable<{
    status: string;
    message: string;
    data: ApproveRequests[];
  }> {
    let params = new HttpParams()
      .set('limit', itemsPerPage)
      .set('offset', (currentPage - 1) * itemsPerPage);

    if (selectedStatus) {
      params = params.set('order', selectedStatus);
    }

    console.log(params);
    return this.http.get<{
      status: string;
      message: string;
      data: ApproveRequests[];
    }>(`${this.apiUrl}/service/request/approved`, { params });
  }

  addReview(body: Review): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.post<{
      status: string;
      message: string;
    }>(`${BaseUrl}/api/householder/review`, body);
  }
}

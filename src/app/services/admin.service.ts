import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiUrlWithAdmin } from './../config';
import { ApiUrlWithUser, BaseUrl } from '../config';
import {
  ApproveRequests,
  Booking,
  ProviderServiceDetail,
  RequestBody,
  ServiceCategory,
} from '../models/service.model';
import { AdminUser } from '../models/user.model';
import { AddReviewFormComponent } from '../householder/add-review-form/add-review-form.component';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  userId: string = '';
  apiUrl: string = `${BaseUrl}${ApiUrlWithAdmin}`;
  apiUserUrl: string = `${BaseUrl}${ApiUrlWithUser}`;
  http: HttpClient = inject(HttpClient);
  deleteService(serviceId: string): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.delete<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/service/${serviceId}`);
  }

  addService(body: { category_name: string; description: string }): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.post<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/service`, body);
  }

  getUser(email: string): Observable<{
    status: string;
    message: string;
    data: AdminUser;
  }> {
    return this.http.get<{
      status: string;
      message: string;
      data: AdminUser;
    }>(`${this.apiUrl}/users/${email}`);
  }

  requestService(data: RequestBody): Observable<{
    status: string;
    message: string;
    data: { request_id: string };
  }> {
    const params = { user_id: this.userId };
    return this.http.post<{
      status: string;
      message: string;
      data: { request_id: string };
    }>(`${this.apiUserUrl}/services/request`, data, { params });
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
      .set('offset', (currentPage - 1) * itemsPerPage)
      .set('user_id',this.userId);

    if (selectedStatus) {
      params = params.set('status', selectedStatus);
    }
    return this.http.get<{
      status: string;
      message: string;
      data: Booking[];
    }>(`${this.apiUserUrl}/bookings`, { params });
  }

  cancelServiceRequest(requestId: string): Observable<{
    status: string;
    message: string;
  }> {
    const params = { user_id: this.userId };
    console.log('in service :', params);
    return this.http.patch<{
      status: string;
      message: string;
    }>(`${this.apiUserUrl}/services/request/${requestId}`, null, { params });
  }

  updateServiceRequest(data: {
    id: string;
    scheduled_time: string;
  }): Observable<{
    status: string;
    message: string;
  }> {
    const params = { user_id: this.userId };
    return this.http.put<{
      status: string;
      message: string;
    }>(`${this.apiUserUrl}/services/request`, data, { params });
  }

  approveRequest(body: {
    request_id: string;
    provider_id: string;
  }): Observable<{
    status: string;
    message: string;
  }> {
    const params = { user_id: this.userId };
    return this.http.put<{
      status: string;
      message: string;
    }>(`${this.apiUserUrl}/services/request/approve`, body, { params });
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
      .set('offset', (currentPage - 1) * itemsPerPage)
      .set('user_id',this.userId);
    if (selectedStatus) {
      params = params.set('order', selectedStatus);
    }

    return this.http.get<{
      status: string;
      message: string;
      data: ApproveRequests[];
    }>(`${this.apiUserUrl}/service/request/approved`, { params });
  }

  fetchServices(
    itemsPerPage: number,
    currentPage: number
  ): Observable<{
    status: string;
    message: string;
    data: ProviderServiceDetail[];
  }> {
    const params = {
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    };
    return this.http.get<{
      status: string;
      message: string;
      data: ProviderServiceDetail[];
    }>(`${this.apiUserUrl}/services`, { params });
  }

  deactivateAccount(providerId: string): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.patch<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/deactivate/${providerId}`, null);
  }
}

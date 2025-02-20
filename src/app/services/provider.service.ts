import {
  ProviderApproveRequest,
  ProviderReview,
  ProviderViewRequest,
  Service,
} from './../models/service.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiUrlWithProvider, ApiUrlWithUser, BaseUrl } from '../config';
import {
  AddService,
  ProviderDetail,
  ProviderServiceDetail,
} from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  serviceDetail: ProviderServiceDetail[] = [];
  apiUrl: string = `${BaseUrl}${ApiUrlWithProvider}`;
  private http = inject(HttpClient);

  getProviderService(): Observable<{
    status: string;
    message: string;
    data: ProviderServiceDetail[];
  }> {
    return this.http
      .get<{ status: string; message: string; data: ProviderServiceDetail[] }>(
        `${this.apiUrl}/service`
      )
      .pipe(
        tap((response) => {
          this.serviceDetail = response.data;
          console.log(this.serviceDetail);
        })
      );
  }

  addService(body: AddService): Observable<{
    status: string;
    message: string;
    data: { service_id: string };
  }> {
    return this.http
      .post<{
        status: string;
        message: string;
        data: { service_id: string };
      }>(`${this.apiUrl}/service`, body)
      .pipe<{
        status: string;
        message: string;
        data: { service_id: string };
      }>(
        catchError((error) => {
          console.error('Error adding service:', error);
          return throwError(() => error);
        })
      );
  }

  updateService(
    body: AddService,
    serviceId: string
  ): Observable<{ status: string; message: string }> {
    const newBody = {
      name: body.name,
      description:body.description,
      price: body.price,
      category:body.category
    }
    return this.http.put<{ status: string; message: string }>(
      `${this.apiUrl}/service/${serviceId}`,
      newBody
    );
  }

  deleteService(
    serviceId: string
  ): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/service/${serviceId}`
    );
  }

  viewServiceRequest(
    itemsPerPage: number,
    currentPage: number,
    selectedFilter: string
  ): Observable<{
    status: string;
    message: string;
    data: ProviderViewRequest[];
  }> {
    let params = new HttpParams()
      .set('limit', itemsPerPage)
      .set('offset', (currentPage - 1) * itemsPerPage);

    if (selectedFilter) {
      params = params.set('serviceId', selectedFilter);
    }
    return this.http.get<{
      status: string;
      message: string;
      data: ProviderViewRequest[];
    }>(`${this.apiUrl}/service/requests`, { params });
  }

  acceptServiceRequest(body: {
    request_id: string;
    price: string;
  }): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.post<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/service/requests`, body);
  }

  viewApprovedRequest(
    itemsPerPage: number,
    currentPage: number,
    selectedStatus:string
  ): Observable<{
    status: string;
    message: string;
    data: ProviderApproveRequest[];
  }> {
    let params = new HttpParams()
    .set('limit', itemsPerPage)
    .set('offset', ((currentPage - 1) * itemsPerPage));

  if (selectedStatus) {
    params = params.set('order', selectedStatus);
  }

    return this.http.get<{
      status: string;
      message: string;
      data: ProviderApproveRequest[];
    }>(`${BaseUrl}${ApiUrlWithUser}/service/request/approved`, { params });
  }

  getReview(
    itemsPerPage: number,
    currentPage: number,
    selectedStatus:string
  ): Observable<{
    status: string;
    message: string;
    data: ProviderReview[];
  }> {
    let params = new HttpParams()
    .set('limit', itemsPerPage)
    .set('offset', ((currentPage - 1) * itemsPerPage));

  if (selectedStatus) {
    params = params.set('serviceId', selectedStatus);
  }
    return this.http.get<{
      status: string;
      message: string;
      data: ProviderReview[];
    }>(`${BaseUrl}${ApiUrlWithProvider}/reviews`, { params });
  }
}

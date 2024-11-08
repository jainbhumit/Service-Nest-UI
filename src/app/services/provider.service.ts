import { ProviderApproveRequest, ProviderViewRequest, Service } from './../models/service.model';
import { HttpClient } from '@angular/common/http';
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

  addService(
    body: AddService
  ): Observable<{
    status: string;
    message: string;
    data: { service_id: string };
  }> {
    return this.http.post<{
      status: string;
      message: string;
      data: { service_id: string };
    }>(`${this.apiUrl}/service`, body).pipe<{
      status: string;
      message: string;
      data: { service_id: string };
    }>(
      catchError((error) => {
        console.error("Error adding service:", error);
        return throwError(() => error);
      }));
  }

  updateService(
    body: AddService,
    serviceId: string
  ): Observable<{ status: string; message: string }> {
    return this.http.put<{ status: string; message: string }>(
      `${this.apiUrl}/service/${serviceId}`,
      body
    );
  }

  deleteService(
    serviceId: string
  ): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/service/${serviceId}`
    );
  }

  viewServiceRequest(itemsPerPage:number , currentPage: number):Observable<{
    status: string;
    message: string;
    data: ProviderViewRequest[]; 
  }> {
    const params = {
      limit : itemsPerPage,
      offset: (currentPage-1) * itemsPerPage
    }
    return this.http.get<{
    status: string;
    message: string;
    data: ProviderViewRequest[]; 
    }>(`${this.apiUrl}/service/requests`,{params})
  }

  acceptServiceRequest(body:{request_id:string,price:string}):Observable<{
    status: string;
    message: string;
  }> {
    return this.http.post<{
    status: string;
    message: string;
    }>(`${this.apiUrl}/service/requests`,body)
  }

  viewApprovedRequest(itemsPerPage: number, currentPage: number):Observable<{
    status:string,
    message:string,
    data:ProviderApproveRequest[]
  }> {
    const params = {
      limit: itemsPerPage,
      offset: (currentPage-1) * itemsPerPage
    }
    return this.http.get<{
      status:string,
      message:string,
      data:ProviderApproveRequest[]
    }>(`${BaseUrl}${ApiUrlWithUser}/service/request/approved`,{params})
  }
}

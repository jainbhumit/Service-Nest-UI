import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  ApproveRequests,
  Booking,
  EvaluatedKey,
  ProviderInfo,
  RequestBody,
  Review,
  Service,
} from '../models/service.model';
import { ApiUrlWithUser, BaseUrl } from '../config';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class HouseholderService {
  currentAcceptRequestDetail = signal<{
    request_id: string;
    status:string;
    service_id:string;
    provider_details: ProviderInfo[];
  }>({
    request_id: '',
    status:'',
    service_id:'',
    provider_details: [],
  });
  private apiUrl = `${BaseUrl}${ApiUrlWithUser}`;
  private bookings: Booking[] | null = null;
  constructor(private http: HttpClient) {}

  getServiceByCategory(
    categoryId: string
  ): Observable<{ status: string; message: string; data: Service[] }> {
    console.log(`in service category name is : ${categoryId}`);
    return this.http.get<{ status: string; message: string; data: Service[] }>(
      `${this.apiUrl}/services?category_id=${categoryId}`
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
    lastEvaluatedKey: EvaluatedKey | null,
    selectedStatus: string
  ): Observable<{
    status: string;
    message: string;
    data: {
      serviceRequests: Booking[]
      lastEvaluatedKey:EvaluatedKey | null
    };
  }> {
    let params = new HttpParams()
      .set('limit', itemsPerPage);

    if (selectedStatus) {
      params = params.set('status', selectedStatus);
    }
    const EvaluatedKey = {
      PK: { S: lastEvaluatedKey?.PK.Value},
      SK: { S: lastEvaluatedKey?.SK.Value }
    };
    
    return this.http
      .post<{
        status: string;
        message: string;
        data:{
          serviceRequests: Booking[]
          lastEvaluatedKey:EvaluatedKey | null
        };
      }>(`${this.apiUrl}/bookings`,EvaluatedKey, { params })
      .pipe(
        tap((response) => {
          this.bookings = response.data.serviceRequests;
        })
      );
  }

  getStoredBookings(): Booking[] | null {
    return this.bookings;
  }

  cancelServiceRequest(requestId: string,status:string): Observable<{
    status: string;
    message: string;
  }> {
    return this.http.patch<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/services/request/${requestId}?status=${status}`,null);
  }

  updateServiceRequest(data: {
    id: string;
    scheduled_time: string;
  },status:string): Observable<{
    status: string;
    message: string;
  }> {
    let params = new HttpParams()
      .set('status',status );
    return this.http.put<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/services/request`, data,{params});
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

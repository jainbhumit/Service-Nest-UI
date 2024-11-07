import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrlWithUser, BaseUrl } from '../config';
import { UpdateProfile, UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${BaseUrl}${ApiUrlWithUser}`;
  constructor(private http: HttpClient) {}

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

  updateProfile(data:UpdateProfile):Observable<{
    status: string;
    message: string;
  }> {
    return this.http.put<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/profile`,data);

  }
}

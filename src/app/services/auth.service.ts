import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';

import { BaseUrl, Role, TokenKey } from '../config';
import {
  ForgetPasswordData,
  LoginData,
  SignupData,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = BaseUrl;
  userRole = signal<Role | undefined>(undefined);
  isLoading = signal(false); 
  isOtpSent:boolean =false;
  constructor(private http: HttpClient) {}

  signup(data: SignupData): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  login(credentials: LoginData): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.data && response.data.token) {
          this.setToken(response.data.token);
          this.getRole(response.data.token);
        }
      })
    );
  }

  forgetPassword(data: ForgetPasswordData) {
    return this.http.put(`${this.apiUrl}/forgot`, data);
  }

  private setToken(token: string): void {
    localStorage.setItem(TokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TokenKey);
  }

  logout(): void {
    localStorage.removeItem(TokenKey);
  }

  getRole(token: string) {
    const decodedToken = jwtDecode<JwtPayload>(token) as unknown as JwtPayload;

    if (
      decodedToken &&
      typeof decodedToken === 'object' &&
      'role' in decodedToken
    ) {
      const userRole = (decodedToken as any).role;
      this.userRole.set(userRole);
    }
  }
  private hasToken(): boolean {
    return !!this.getToken();
  }

  generateOtp(email:string):Observable<
  {
    status:string;
    message:string;
  }>{
    return this.http.post<{
      status:string,
    message:string
    }>(`${this.apiUrl}/otp`, {email:email});
  }


}

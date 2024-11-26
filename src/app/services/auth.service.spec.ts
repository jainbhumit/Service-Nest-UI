import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ForgetPasswordData, LoginData, SignupData } from '../models/auth.model';
import { Role } from '../config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should signup successfully', () => {
    const mockResponse = {status:'success',message:'signup successfully'};
    const mockRequestBody: SignupData = {
      name: 'test',
      email: 'test@gmail.com',
      password: 'Abc@123',
      role: Role.householder,
      address: 'noida',
      contact: '9097697',
      security_answer: 'alok',
  }



  service.signup(mockRequestBody).subscribe((response) => {
    expect(response).toEqual(mockResponse);
  })

  const req = httpMock.expectOne(`http://localhost:8080/signup`);
  expect(req.request.method).toBe('POST');
  req.flush(mockResponse);
  })

  it('should login successfully', () => {
    const mockRequestBody: LoginData = {
      email: 'test@example.com',
      password: 'Test@123'
    }
    
    spyOn(service,'getRole');
    const mockResponse = {status:'success',message:'login successfully',data:{token:'token'}}

    service.login(mockRequestBody).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    })

    const req = httpMock.expectOne(`http://localhost:8080/login`);
    req.flush(mockResponse);
    expect(req.request.method).toBe('POST');
    expect(service.getRole).toHaveBeenCalledTimes(1);

  })

  it('should forgot password successfully',() => {
    const mockRequestBody:ForgetPasswordData = {
      email: 'test@example.com',
      otp: '1234',
      password: 'tests@123'
    }
    const mockResponse = {status:"success",message:"password forgot successfully"};
    service.forgetPassword(mockRequestBody).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    })
    const req = httpMock.expectOne(`http://localhost:8080/forgot`);
    req.flush(mockResponse);
    expect(req.request.method).toBe('PUT');
  })
});

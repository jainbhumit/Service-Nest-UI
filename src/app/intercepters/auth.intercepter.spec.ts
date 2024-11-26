// import {
//   HttpClientTestingModule,
//   HttpTestingController,
// } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { of } from 'rxjs';
// import { TokenKey } from '../config';
// import { authInterceptor, authResponseInterceptor } from './auth.intercepter';

// describe('Auth Interceptors', () => {
//   let httpMock: HttpTestingController;
//   let httpClient: HttpClient;
//   let mockRouter: jasmine.SpyObj<Router>;

//   beforeEach(() => {
//     mockRouter = jasmine.createSpyObj('Router', ['navigate']);

//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [
//         HttpClientModule,
//         { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true },
//         { provide: HTTP_INTERCEPTORS, useValue: authResponseInterceptor, multi: true },
//         { provide: Router, useValue: mockRouter },
//       ],
//     });

//     httpMock = TestBed.inject(HttpTestingController);
//     httpClient = TestBed.inject(HttpClient);
//   });

//   afterEach(() => {
//     httpMock.verify();
//     localStorage.clear();
//   });

//   describe('authInterceptor', () => {
//     it('should add an Authorization header if token exists in localStorage', () => {
//       const testToken = 'mock-token';
//       localStorage.setItem(TokenKey, testToken);

//       httpClient.get('/test').subscribe();

//       const req = httpMock.expectOne('/test');
//       expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
//       req.flush({});
//     });

//     it('should not add an Authorization header if no token exists in localStorage', () => {
//       httpClient.get('test').subscribe();

//       const req = httpMock.expectOne('/test');
//       expect(req.request.method).toBe('GET');
//       expect(req.request.headers.has('Authorization')).toBeFalse();
//       req.flush({});
//     });
//   });

//   describe('authResponseInterceptor', () => {
//     it('should redirect to /login if response status is 401', () => {
//       httpClient.get('/test').subscribe({
//         error: (error: HttpErrorResponse) => {
//           expect(error.status).toBe(401);
//         },
//       });

//       const req = httpMock.expectOne('/test');
//       req.flush(null, { status: 401, statusText: 'Unauthorized' });

//       expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
//     });

//     it('should not redirect for non-401 errors', () => {
//       httpClient.get('/test').subscribe({
//         error: (error: HttpErrorResponse) => {
//           expect(error.status).toBe(403);
//         },
//       });

//       const req = httpMock.expectOne('/test');
//       req.flush(null, { status: 403, statusText: 'Forbidden' });

//       expect(mockRouter.navigate).not.toHaveBeenCalled();
//     });

//     it('should allow successful responses to pass through', () => {
//       httpClient.get('/test').subscribe((response) => {
//         expect(response).toEqual({ data: 'success' });
//       });

//       const req = httpMock.expectOne('/test');
//       req.flush({ data: 'success' });
//     });
//   });
// });

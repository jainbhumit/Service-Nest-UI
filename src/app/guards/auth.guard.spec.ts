// import { TestBed } from '@angular/core/testing';
// import { Router, UrlTree } from '@angular/router';
// import { authGuard } from './auth.guard';
// import { AuthService } from '../services/auth.service';
// import { JwtPayload } from 'jwt-decode';
// import { Role } from '../config';
// import { inject, signal } from '@angular/core';

// class MockAuthService {
//   userRole = {
//     set: jasmine.createSpy('set'),
//   };
// }

// describe('authGuard', () => {
//   let mockRouter: jasmine.SpyObj<Router>;
//   let mockAuthService: MockAuthService;

//   beforeEach(() => {
//     // Create mock instances
//     mockRouter = jasmine.createSpyObj('Router', ['parseUrl']);

//     mockAuthService = new MockAuthService();

//     // Configure TestBed
//     TestBed.configureTestingModule({
//       providers: [
//         { provide: Router, useValue: mockRouter },
//         { provide: AuthService, useValue: mockAuthService },
//       ],
//     });
//   });

//   afterEach(() => {
//     localStorage.clear(); // Ensure localStorage is cleaned up after each test
//   });

//   it('should redirect to /login if no token is present', () => {
//     // Arrange
//     localStorage.removeItem('authToken');
//     mockRouter.parseUrl.and.callThrough(); // Mock parseUrl implementation


//     // Act
//     const result = authGuard({} as any, { url: '/householder' } as any);

//     // Assert
//     expect(mockRouter.parseUrl).toHaveBeenCalledTimes(1)
  
//   });

//   it('should redirect to /login if the token is invalid', () => {
//     // Arrange
//     localStorage.setItem('authToken', 'invalid-token'); // Mock an invalid token

//     // Act
//     const result = authGuard({} as any, { url: '/householder' } as any);

//     // Assert
//     expect(mockRouter.parseUrl).toHaveBeenCalledWith('/login');
//     // expect(result).toBe('/login');
//   });

//   it('should redirect to /unauthorized if the role does not match the route', () => {
//     // Arrange
//     const mockToken = JSON.stringify({ role: 'Admin' });
//     localStorage.setItem('authToken', btoa(mockToken)); // Mock a valid token
//     spyOn(window, 'atob').and.callFake(() => mockToken);

//     // Act
//     const result = authGuard({} as any, { url: '/householder' } as any);

//     // Assert
//     expect(mockRouter.parseUrl).toHaveBeenCalledWith('/unauthorized');
//     // expect(result).toBe('/unauthorized');
//   });

//   it('should allow navigation if the role matches the route', () => {
//     // Arrange
//     const mockToken = JSON.stringify({ role: 'Householder' });
//     localStorage.setItem('authToken', btoa(mockToken)); // Mock a valid token
//     spyOn(window, 'atob').and.callFake(() => mockToken);

//     // Act
//     const result = authGuard({} as any, { url: '/householder' } as any);

//     // Assert
//     expect(result).toBeTrue();
//     expect(mockAuthService.userRole.set).toHaveBeenCalledWith('Householder');
//   });
// });
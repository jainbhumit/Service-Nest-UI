export const TokenKey = 'authToken';
export enum Role {
  admin = 'Admin',
  householder = 'Householder',
  serviceProvider = 'ServiceProvider',
}
export const BaseUrl = 'http://localhost:8080';
export const ApiUrlWithUser = '/api/user';
export const ApiUrlWithProvider = '/api/provider';
export const ApiUrlWithAdmin = '/api/admin';
export const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const TestTokenHouseholder = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkhvdXNlaG9sZGVyIiwiZXhwIjoxODE2MjM5MDIyfQ.fCgUbVhwYjbUBRg6ELH4VwCpJGIUBAauJIwt5Ww8YlQ'
export const TestTokenProvider = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IlNlcnZpY2VQcm92aWRlciIsImV4cCI6MTgxNjIzOTAyMn0.FaYly2kgdEI4zYXrCwO_YXjfMbOvmQN7zYvpC0BVfA8'
export const TestTokenAdmin = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFkbWluIiwiZXhwIjoxODE2MjM5MDIyfQ.bC-i85AvfLkOQawaxNhkDcLkNbXwLUKugIkZGa7nAiY'

export const TokenKey = 'authToken';
export enum Role {
admin = 'Admin',
householder = 'Householder',
serviceProvider = 'ServiceProvider'
}
export const BaseUrl = 'http://localhost:8080';
export const ApiUrlWithUser = '/api/user';
export const ApiUrlWithProvider = '/api/provider';
export const ApiUrlWithAdmin = '/api/admin';
export const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
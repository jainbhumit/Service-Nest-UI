import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JwtPayload, LoginData } from '../../models/auth.model';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Role } from '../../config';

function validPassword(control: AbstractControl) {
  const password = control.value;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password) ? null : { invalidPassword: true };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  router: Router = inject(Router);
  errorMessage = '';
  isLoading:boolean = false;

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required, validPassword],
    }),
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  Login() {
    if (this.loginForm.valid) {
      const loginData: LoginData = {
        email: this.email?.value as string,
        password: this.password?.value as string,
      };
      this.authService.isLoading.update(()=>true);
      this.authService.login(loginData).subscribe({
        next: (response) => {
          const token = response.data.token;
          const decodedToken = jwtDecode<JwtPayload>(
            token
          ) as unknown as JwtPayload;

          if (
            decodedToken &&
            typeof decodedToken === 'object' &&
            'role' in decodedToken
          ) {
            const userRole = (decodedToken as any).role;
            console.log(userRole, 'calling from login ts');
            this.authService.userRole.set(userRole);
            if (userRole === Role.admin) {
              this.router.navigate(['/admin/home']);
            } else if (userRole === Role.householder) {
              this.router.navigate(['/householder/home']);
            } else if (userRole === Role.serviceProvider) {
              this.router.navigate(['/provider/home']);
            }
          } else {
            console.error('Role not found in token');
          }
        },
        error: (error) => {
          console.log(error);
          this.errorMessage = error.error.message;
        },
      });
      this.authService.isLoading.update(()=>false);
    } else {
      this.loginForm.markAllAsTouched();
    }
    this.isLoading = false
  }
}

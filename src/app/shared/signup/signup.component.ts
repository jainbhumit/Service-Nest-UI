import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { SignupData } from '../../models/auth.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router: Router = inject(Router);
  errMessage: string = '';
  isLoading:boolean = false;
  messageService:MessageService = inject(MessageService);

  signupForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      ),
    ]),
    role: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    contact: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10,}$/),
    ]),
    securityAnswer: new FormControl('', Validators.required),
  });

  onPasswordInput() {
    const password = this.signupForm.get('password');
    if (password?.errors) {
      if (password.errors['required']) {
        this.errMessage = 'Password is required.';
      } else if (password.errors['minlength']) {
        this.errMessage = 'Password must be at least 8 characters long.';
      } else if (password.errors['pattern']) {
        this.errMessage =
          'Password must contain an uppercase letter, a symbol, and a digit.';
      }
    } else {
      this.errMessage = '';
    }
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const user: SignupData = {
        name: this.signupForm.get('username')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value,
        role: this.signupForm.get('role')?.value,
        address: this.signupForm.get('address')?.value,
        contact: this.signupForm.get('contact')?.value,
        security_answer: this.signupForm.get('securityAnswer')?.value,
      };
      this.isLoading = true;
      this.authService.signup(user).subscribe({
        next: (response) => {
          if (response.status == 'Success') {
            this.messageService.add({
              severity:"success",
              summary:"Success",
              detail:response.message
            })
            this.router.navigate(['/login']);
            return;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity:"error",
            summary:"Error",
            detail:err.error.message
          })
          this.isLoading =false;
          this.errMessage = err.error.message
        }, 
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}

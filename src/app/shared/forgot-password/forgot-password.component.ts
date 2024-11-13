import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ForgetPasswordData } from '../../models/auth.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

function validPassword(control: AbstractControl) {
  const password = control.value;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password) ? null : { invalidPassword: true };
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);
  errorMessage: string = '';
  forgotForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    updatedPassword: new FormControl('', {
      validators: [Validators.required, validPassword],
    }),
    securityAnswer: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  get email() {
    return this.forgotForm.get('email');
  }

  get password() {
    return this.forgotForm.get('updatedPassword');
  }

  get securityAnswer() {
    return this.forgotForm.get('securityAnswer');
  }

  ForgotPassword() {
    if (this.forgotForm.valid) {
      const updatedData: ForgetPasswordData = {
        email: this.email?.value as string,
        security_answer: this.securityAnswer?.value as string,
        password: this.password?.value as string,
      };
      this.authService.isLoading.update(()=>true);
      this.authService.forgetPassword(updatedData).subscribe({
        next: (response) => {
          if (response) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'password update succesfully',
            });
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        },
      });
      this.authService.isLoading.update(()=>false);
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}

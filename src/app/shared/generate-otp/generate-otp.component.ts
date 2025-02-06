import { RequestBody } from './../../models/service.model';
import { UserService } from './../../services/user.service';
import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-generate-otp',
  templateUrl: './generate-otp.component.html',
  styleUrl: './generate-otp.component.scss',
})
export class GenerateOtpComponent {
  onGenerate = output<{ email: string; status: boolean }>();
isLoading: any;

  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}
  errorMessage: string = '';

  otpForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get email() {
    return this.otpForm.get('email');
  }

  generateOtp() {
    if (this.otpForm.valid) {
      this.authService.isLoading.set(true);
      this.authService.generateOtp(this.email?.value).subscribe({
        next: (response) => {
          if (response.message == 'Otp Sent successfully') {
            this.messageService.add({
              severity: 'success',
              summary: 'Sent',
              detail: response.message,
            });
            this.onGenerate.emit({ email: this.email?.value, status: true });
          }
          this.authService.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          this.authService.isLoading.set(false);
        },
      });
    } else {
      this.otpForm.markAllAsTouched();
    }
  }
}

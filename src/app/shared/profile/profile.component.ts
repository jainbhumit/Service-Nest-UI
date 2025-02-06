import { MessageService } from 'primeng/api';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { UpdateProfile, UserProfile } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Role } from '../../config';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private location = inject(Location);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  isLoading:boolean = false;
  update: boolean = false;
  router: Router = inject(Router);
  errorMessage: string = '';
  user: UserProfile = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    address: '',
    contact: '',
    security_answer: '',
    is_active: true,
  };
  userRole: Role | undefined;
  updateForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      ),
    ]),
    role: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    contact: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10,}$/),
    ]),
  });
  ngOnInit(): void {
    this.isLoading=true
    this.userRole = this.authService?.userRole();
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.user = response.data;
        this.updateForm.setValue({
          name: this.user.name,
          email: this.user.email,
          password: this.user.password,
          address: this.user.address,
          contact: this.user.contact,
          role: this.user.role,
        });
        this.updateForm.controls['name'].disable();
        this.updateForm.controls['role'].disable();
        this.updateForm.controls['email'].disable();
        this.updateForm.controls['password'].disable();
        this.updateForm.controls['address'].disable();
        this.updateForm.controls['contact'].disable();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err.error.message);
      },
    });
  }
  UpdateProfile() {
    this.update = true;
    this.updateForm.controls['email'].enable();
    this.updateForm.controls['password'].enable();
    this.updateForm.controls['password'].setValue('');
    this.updateForm.controls['address'].enable();
    this.updateForm.controls['contact'].enable();
  }

  Update() {
    if (this.updateForm.valid) {
      const data: UpdateProfile = {
        email: this.updateForm.controls['email'].value as string,
        password: this.updateForm.value.password as string,
        address: this.updateForm.value.address as string,
        contact: this.updateForm.value.contact as string,
      };
      this.authService.isLoading.set(true);
      this.userService.updateProfile(data).subscribe({
        next: (response) => {
          if (response.status == 'Success') {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User update successfully',
            });
            if (this.userRole == 'Householder') {
              this.router.navigate(['/householder/home']);
            } else if (this.userRole === 'ServiceProvider') {
              this.router.navigate(['/provider/home']);
            } else {
              this.router.navigate(['/admin/home']);
            }
          }
        },
        error: (err) => {
          if (err.error.message == 'Error updating user') {
            this.errorMessage = 'email id already exist';
          } else {
            this.errorMessage = err.error.message;
          }
        },
      });
      this.authService.isLoading.set(false);
    } else {
      console.log('Not valid ');
    }
  }

  onPasswordInput() {
    const password = this.updateForm.get('password');
    if (password?.errors) {
      if (password.errors['required']) {
        this.errorMessage = 'Password is required.';
      } else if (password.errors['minlength']) {
        this.errorMessage = 'Password must be at least 8 characters long.';
      } else if (password.errors['pattern']) {
        this.errorMessage =
          'Password must contain an uppercase letter, a symbol, and a digit.';
      }
    } else {
      this.errorMessage = '';
    }
  }

  onBack() {
    this.location.back();
  }

  getRouterLink(path: string): string {
    if (this.userRole === 'Householder') {
      return `/householder/${path}`;
    } else if (this.userRole === 'ServiceProvider') {
      return `/provider/${path}`;
    } else {
      return `/admin/${path}`;
    }
  }
}

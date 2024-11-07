import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UpdateProfile, UserProfile } from '../../models/user.model';
import { Router } from '@angular/router';
import { LocalizedString } from '@angular/compiler';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private location = inject(Location)
  private userService = inject(UserService);
  update: boolean = false;
  router:Router = inject(Router);
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
    contact: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]),
  });
  ngOnInit(): void {
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
      },
      error: (err) => {
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
      const data:UpdateProfile = {
        email: this.updateForm.controls['email'].value as string,
        password:this.updateForm.value.password as string,
        address: this.updateForm.value.address as string,
        contact:this.updateForm.value.contact as string
      }
      this.userService.updateProfile(data).subscribe({
        next:(response) => {
          if(response.status=='Success') {
            console.log('User update successfully');
            this.router.navigate(['/householder/home']);
          }
        },
        error: (err) => {
          this.errorMessage=err.error.message;
        }
      })
    }else {
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
}

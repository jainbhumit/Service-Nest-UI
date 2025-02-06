import { Component, Inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

import { ProviderService } from '../../services/provider.service';
import { Role } from '../../config';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-accept-service-dialog',
  templateUrl: './accept-service-dialog.component.html',
  styleUrl: './accept-service-dialog.component.scss',
})
export class AcceptServiceDialogComponent {
  userRole: Role | undefined = this.authService.userRole();
  isLoading: boolean = false;
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private providerService: ProviderService,
    private dialogRef: MatDialogRef<AcceptServiceDialogComponent>,
    private messageService: MessageService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { request_id: string , service_id:string, status:string}
  ) {}
  acceptServiceForm: FormGroup = new FormGroup({
    price: new FormControl('', [Validators.required]),
  });

  emailForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.userRole === 'ServiceProvider') {
      const body: { request_id: string; price: string; service_id:string; status:string } = {
        request_id: this.data.request_id,
        price: this.acceptServiceForm.get('price')?.value,
        service_id:this.data.service_id,
        status: this.data.status
      };
      console.log(body);
      this.isLoading = true
      this.providerService.acceptServiceRequest(body).subscribe({
        next: (response) => {
          console.log(response);
          if (response.message == 'provider not found') {
            this.messageService.add({
              severity: 'warning',
              summary: 'Warning',
              detail: 'you did not have this service',
            });
            this.dialogRef.close();
          } else {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Service Accept successfully',
            });
            this.dialogRef.close();
          }
          this.isLoading = false;
        },
        error: (err) =>{
          if(err.error.message =='service request not found') {
            this.messageService.add({
              severity: 'warning',
              summary: 'Warning',
              detail: 'you did not have this service',
            });
            this.dialogRef.close();
          }else{
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message,
            });
            this.dialogRef.close();
          }
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = true
      this.adminService.getUser(this.emailForm.get('email')?.value).subscribe({
        next: (response) => {
          if (response.data) {
            this.adminService.userId = response.data.id;
            this.dialogRef.close(true);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error.message,
          })
          this.isLoading = false;
        }
      });
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
}

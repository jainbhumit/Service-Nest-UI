import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';

import { AdminService } from '../../services/admin.service';
import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-request-dialog',
  templateUrl: './edit-request-dialog.component.html',
  styleUrl: './edit-request-dialog.component.scss',
})
export class EditRequestDialogComponent {
  scheduledTime = new FormControl('', Validators.required);
  isLoading:boolean = false 
  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<EditRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { request_id: string; scheduled_time: string ,status:string},
    private householderService: HouseholderService,
    private datePipe: DatePipe,
    private adminService: AdminService,
    private messageService: MessageService
  ) {}

  onConfirm(): void {
    if (this.scheduledTime.valid) {
      let dateTime =
        this.datePipe.transform(this.scheduledTime.value, 'yyyy-MM-ddTHH:mm') ||
        '';
      dateTime = dateTime.replace('T', ' ');
      const body: { id: string; scheduled_time: string } = {
        id: this.data.request_id,
        scheduled_time: dateTime,
      };
      this.isLoading = true;
      if (this.authService.userRole() === Role.householder) {
        this.householderService.updateServiceRequest(body,this.data.status).subscribe({
          next: (response) => {
            console.log('update request successfully');
            this.dialogRef.close(body.scheduled_time);
            this.isLoading = false;
          },
          error: (err) => {
            if(err.error.message=='only pending request rescheduled') {
              this.messageService.add({severity:'error',summary:'Failed',detail:'only pending and accepted request reschedule'})
            }
            this.isLoading = false;
            this.dialogRef.close();
          },
        });
      } else {
        this.adminService.updateServiceRequest(body,this.data.status).subscribe({
          next: (response) => {
            console.log('update request successfully');
            this.dialogRef.close(body.scheduled_time);
            this.isLoading = false;
          },
          error: (err) => {
            console.log(err.error.message);
            this.dialogRef.close();
            this.isLoading = false;
          },
        });
      }
    } else {
      this.dialogRef.close(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

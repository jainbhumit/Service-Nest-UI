import { DatePipe } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';

import { HouseholderService } from '../../services/householder.service';
import { RequestBody } from '../../models/service.model';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../config';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-request-service-form',
  templateUrl: './request-service-form.component.html',
  styleUrl: './request-service-form.component.scss',
})
export class RequestServiceFormComponent {
  requestServiceForm: FormGroup;
  datePipe = inject(DatePipe);
  userRole: Role | undefined = this.authService.userRole();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RequestServiceFormComponent>,
    private householderService: HouseholderService,
    private adminService: AdminService,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: { category: string; user_id: string },
    private authService: AuthService
  ) {
    this.requestServiceForm = this.fb.group({
      service_name: ['', Validators.required],
      category: [data.category, Validators.required],
      description: ['', Validators.required],
      scheduled_date: ['', Validators.required],
      scheduled_time: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.requestServiceForm.valid) {
      const { scheduled_date, scheduled_time } = this.requestServiceForm.value;
      const scheduledDateTime = new Date(scheduled_date);
      const [hours, minutes] = scheduled_time.split(':');
      scheduledDateTime.setHours(+hours, +minutes);
      const formattedDateTime = this.datePipe.transform(
        scheduledDateTime,
        'yyyy-MM-dd HH:mm'
      );

      const requestData: RequestBody = {
        service_name: this.requestServiceForm.controls['service_name'].value,
        category: this.requestServiceForm.controls['category'].value,
        description: this.requestServiceForm.controls['description'].value,
        scheduled_time: formattedDateTime as string,
      };
      this.authService.isLoading.update(()=>true);
      if (this.userRole === 'Householder') {
        this.householderService.requestService(requestData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Request successfully',
            });
            this.dialogRef.close();
          },
          error: (err) => {
            console.log(err.error.message);
            this.dialogRef.close();
          },
        });
      } else {
        this.adminService.requestService(requestData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Request successfully',
            });
            this.dialogRef.close();
          },
          error: (err) => {
            console.log(err.error.message);
            this.dialogRef.close();
          },
        });
      }
      this.authService.isLoading.update(()=>false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

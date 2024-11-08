import { Component, Inject, InjectionToken } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HouseholderService } from '../../services/householder.service';
import { DatePipe } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-request-dialog',
  templateUrl: './edit-request-dialog.component.html',
  styleUrl: './edit-request-dialog.component.scss'
})
export class EditRequestDialogComponent {
  
  scheduledTime = new FormControl('', Validators.required);
  constructor(
    public dialogRef: MatDialogRef<EditRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {request_id:string,scheduled_time:string},
    private householderService: HouseholderService,
    private datePipe: DatePipe
  ) {}

  onConfirm(): void {
    if (this.scheduledTime.valid) {
      let dateTime = this.datePipe.transform(this.scheduledTime.value, 'yyyy-MM-ddTHH:mm') || '';
      dateTime = dateTime.replace('T',' ');
      const body:{id:string,scheduled_time:string} = {
        id:  this.data.request_id,
        scheduled_time:dateTime
      }
      console.log(body);
      this.householderService.updateServiceRequest(body).subscribe({
        next: (response) => {
          console.log('update request successfully');
          this.dialogRef.close(body.scheduled_time);
        },
        error: (err) =>{
          console.log(err.error.message);
          this.dialogRef.close();
        }
      })
    }else{
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}


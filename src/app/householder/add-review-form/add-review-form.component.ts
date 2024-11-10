import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AcceptedRequestComponent } from '../accepted-request/accepted-request.component';
import { ApproveRequestComponent } from '../approve-request/approve-request.component';
import { HouseholderService } from '../../services/householder.service';
import { Review } from '../../models/service.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-review-form',
  templateUrl: './add-review-form.component.html',
  styleUrl: './add-review-form.component.scss'
})
export class AddReviewFormComponent {
  private messageService = inject(MessageService);
  private householderService = inject(HouseholderService);
  addReviewForm: FormGroup = new FormGroup({
    comment: new FormControl('', [Validators.required]),
    rating: new FormControl('', [Validators.required, Validators.pattern('^[1-5]')])
  });
  constructor(
    public dialogRef: MatDialogRef<AddReviewFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service_id: string, provider_id: string },
  ) { }

  onSubmit() {
    if (this.addReviewForm.valid) {
      const body:Review = {
        service_id:this.data.service_id,
        provider_id:this.data.provider_id,
        review_text:this.addReviewForm.get('comment')?.value,
        rating: this.addReviewForm.get('rating')?.value
      }
      this.householderService.addReview(body).subscribe({
        next:(response) =>{
          this.messageService.add({severity:'success',summary:'Success',detail:response.message})
          this.dialogRef.close();
        },
        error:(err) =>{
          console.log(err.error.message);
        }
      })
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
}

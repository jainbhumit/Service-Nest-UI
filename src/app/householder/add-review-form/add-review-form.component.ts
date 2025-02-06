import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';

import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { Review } from '../../models/service.model';

@Component({
  selector: 'app-add-review-form',
  templateUrl: './add-review-form.component.html',
  styleUrl: './add-review-form.component.scss',
})
export class AddReviewFormComponent {
  isLoading:boolean = false;
  private messageService = inject(MessageService);
  private householderService = inject(HouseholderService);
  addReviewForm: FormGroup = new FormGroup({
    comment: new FormControl('', [Validators.required]),
    rating: new FormControl('', [
      Validators.required,
      Validators.pattern('^[1-5]'),
    ]),
  });
  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<AddReviewFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { service_id: string; provider_id: string ,request_id:string}
  ) {}

  onSubmit() {
    if (this.addReviewForm.valid) {
      const body: Review = {
        request_id:this.data.request_id,
        service_id: this.data.service_id,
        provider_id: this.data.provider_id,
        review_text: this.addReviewForm.get('comment')?.value,
        rating: this.addReviewForm.get('rating')?.value,
      };
      this.isLoading = true;
      this.householderService.addReview(body).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message,
          });
          this.isLoading = false;
          this.dialogRef.close();
        },
        error: (err) => {
          if (
            err.error.message ==
            'review already exists'
          ) {
            this.messageService.add({
              severity: 'info',
              summary: 'Information',
              detail: 'Review already added',
            });
          }
          this.dialogRef.close();
          this.isLoading = false;
          console.log(err.error.message);
        },
      });
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
}

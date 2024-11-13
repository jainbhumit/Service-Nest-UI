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
    public data: { service_id: string; provider_id: string }
  ) {}

  onSubmit() {
    if (this.addReviewForm.valid) {
      const body: Review = {
        service_id: this.data.service_id,
        provider_id: this.data.provider_id,
        review_text: this.addReviewForm.get('comment')?.value,
        rating: this.addReviewForm.get('rating')?.value,
      };
      this.authService.isLoading.update(() => true);
      this.householderService.addReview(body).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message,
          });
          this.dialogRef.close();
        },
        error: (err) => {
          if (
            err.error.message ==
            'review already exists for this provider, service, and householder'
          ) {
            this.messageService.add({
              severity: 'info',
              summary: 'Information',
              detail: 'Review already added',
            });
          }
          this.dialogRef.close();
          console.log(err.error.message);
        },
      });
      this.authService.isLoading.update(() => false);
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
}

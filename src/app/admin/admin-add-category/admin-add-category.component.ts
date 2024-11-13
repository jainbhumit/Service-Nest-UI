import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';

import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-add-category',
  templateUrl: './admin-add-category.component.html',
  styleUrl: './admin-add-category.component.scss',
})
export class AdminAddCategoryComponent {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  addCategoryForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });
  constructor(private dialogRef: MatDialogRef<AdminAddCategoryComponent>) {}
  onCancel() {
    this.dialogRef.close(false);
  }
  onSubmit() {
    const body: {
      category_name: string;
      description: string;
    } = {
      category_name: this.addCategoryForm.get('name')?.value,
      description: this.addCategoryForm.get('description')?.value,
    };
    this.authService.isLoading.update(() => true);
    this.adminService.addService(body).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
        this.dialogRef.close(false);
      },
    });
    this.authService.isLoading.update(() => false);
  }
}

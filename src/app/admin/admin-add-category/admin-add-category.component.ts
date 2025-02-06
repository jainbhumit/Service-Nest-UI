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
    image: new FormControl(null)
  });

  isLoading: boolean = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(private dialogRef: MatDialogRef<AdminAddCategoryComponent>) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please upload an image file',
        });
        return;
      }

      // Validate file size (e.g., 5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Image size should be less than 5MB',
        });
        return;
      }

      this.selectedFile = file;
      this.addCategoryForm.patchValue({ image: file.name });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.addCategoryForm.patchValue({ image: null });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.addCategoryForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Create FormData object to send multipart/form-data
    const formData:{
      category_name:string;
      description:string;
      file_name:string;
    } = {
      category_name:this.addCategoryForm.get('name')?.value,
      description:this.addCategoryForm.get('description')?.value,
      file_name:this.addCategoryForm.get('image')?.value
    }
   
    this.adminService.addService(formData).subscribe({
      next: async (response) => {
        const uploadResponse = await fetch(response.data.pre_signed_url, {
          method: "PUT",
          body: this.selectedFile,
          headers: {
            "Content-Type": this.selectedFile?.type!, // Ensure correct file type
          },
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response.message,
        });
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
        this.isLoading = false;
        this.dialogRef.close(false);
      },
    });
  }
}
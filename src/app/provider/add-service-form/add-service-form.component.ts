import { ProviderService } from './../../services/provider.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RequestServiceFormComponent } from '../../householder/request-service-form/request-service-form.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AddService,
  ProviderDetail,
  ProviderServiceDetail,
} from '../../models/service.model';

@Component({
  selector: 'app-add-service-form',
  templateUrl: './add-service-form.component.html',
  styleUrl: './add-service-form.component.scss',
})
export class AddServiceFormComponent implements OnInit {
  isUpdate: boolean = false;
  constructor(
    private providerService: ProviderService,
    private dialogRef: MatDialogRef<RequestServiceFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      category: string;
      is_update: boolean;
      service_detail: ProviderServiceDetail;
    }
  ) {
    this.isUpdate = data.is_update;
    console.log('Dialog data:', this.data);
  }

  addServiceForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    category: new FormControl(this.data.category, [Validators.required]),
  });

  ngOnInit(): void {
    if (this.data.is_update) {
      console.log('Form oninit');
      this.addServiceForm.setValue({
        name: this.data.service_detail.name,
        category: this.data.service_detail.category,
        description: this.data.service_detail.description,
        price: this.data.service_detail.price,
      });
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
  onSubmit() {
    if (this.addServiceForm.valid) {
      const body: AddService = {
        name: this.addServiceForm.get('name')?.value,
        description: this.addServiceForm.get('description')?.value,
        price: this.addServiceForm.get('price')?.value,
        category: this.addServiceForm.get('category')?.value,
      };
      if (this.isUpdate) {
        this.providerService
          .updateService(body, this.data.service_detail.id)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(true);
            },
            error: (err) => {
              this.dialogRef.close(false);
            },
          });
      } else {
        this.providerService.addService(body).subscribe({
          next: (response) => {
            console.log(body);
            console.log('add service response : ', response);
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.log(err.error.message);
            this.dialogRef.close(false);
          },
        });
      }
    }
  }
}

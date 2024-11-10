import { MessageService } from 'primeng/api';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ServiceCategory } from '../../models/service.model';
import { AdminService } from '../../services/admin.service';
import { NotExpr } from '@angular/compiler';

@Component({
  selector: 'app-admin-add-category',
  templateUrl: './admin-add-category.component.html',
  styleUrl: './admin-add-category.component.scss'
})
export class AdminAddCategoryComponent {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);
  addCategoryForm:FormGroup = new FormGroup({
    name: new FormControl('',[Validators.required]),
    description: new FormControl('',[Validators.required])
  })
  constructor(private dialogRef: MatDialogRef<AdminAddCategoryComponent>){}
  onCancel() {
    this.dialogRef.close();
  }
  onSubmit() {
    const body:{
      category_name:string;
      description:string;
    } = {
      category_name:this.addCategoryForm.get('name')?.value,
      description:this.addCategoryForm.get('description')?.value
    }
    this.adminService.addService(body).subscribe({
      next: (response) => {
        this.messageService.add({severity:'success',summary:'Success',detail:response.message})
        this.dialogRef.close()
      },
      error: (err)=>this.messageService.add({severity:'error',summary:'Error',detail:err.error.message}) 
    })
  }
}

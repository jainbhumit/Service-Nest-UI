import { MessageService } from 'primeng/api';

import { Component, Inject } from '@angular/core';
import { ProviderService } from '../../services/provider.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-accept-service-dialog',
  templateUrl: './accept-service-dialog.component.html',
  styleUrl: './accept-service-dialog.component.scss'
})
export class AcceptServiceDialogComponent {


  constructor(
    private providerService: ProviderService,
    private dialogRef: MatDialogRef<AcceptServiceDialogComponent>,
    private messageService : MessageService,
    @Inject(MAT_DIALOG_DATA) public data: { request_id: string },
  ) {}
  acceptServiceForm:FormGroup = new FormGroup({
    price: new FormControl('',[Validators.required]) 
  })

  onSubmit() {
    const body:{request_id:string,price:string} = {
      request_id:this.data.request_id,
      price:this.acceptServiceForm.get('price')?.value
    }
    console.log(body);
    this.providerService.acceptServiceRequest(body).subscribe({
      next:(response) =>{
        console.log(response);
        if(response.message=='provider not found') {
          this.messageService.add({severity:'warning',summary:'Warning',detail:'you did not have this service'})
        }else{
          this.messageService.add({severity:'success',summary:'Success',detail:'Service Accept successfully'})
        }
      },
      error:(err)=>this.messageService.add({severity:'error',summary:'Error',detail:'error accepting service'})
    })
  }
  onCancel() {
    this.dialogRef.close();
  }
}

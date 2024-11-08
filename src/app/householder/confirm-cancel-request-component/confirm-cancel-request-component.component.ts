import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HouseholderService } from '../../services/householder.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-confirm-cancel-request-component',
  templateUrl: './confirm-cancel-request-component.component.html',
  styleUrl: './confirm-cancel-request-component.component.scss'
})
export class ConfirmCancelRequestComponentComponent {
  messageService = inject(MessageService)
  isProviderRole:boolean = this.data.is_provider;
  constructor(public dialogRef: MatDialogRef<ConfirmCancelRequestComponentComponent>,
    private householderService: HouseholderService,
    @Inject(MAT_DIALOG_DATA) public data: {is_provider:boolean},
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

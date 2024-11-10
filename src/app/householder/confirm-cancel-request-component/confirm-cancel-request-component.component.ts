import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HouseholderService } from '../../services/householder.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../config';

@Component({
  selector: 'app-confirm-cancel-request-component',
  templateUrl: './confirm-cancel-request-component.component.html',
  styleUrl: './confirm-cancel-request-component.component.scss'
})
export class ConfirmCancelRequestComponentComponent {
  messageService = inject(MessageService)
  private authService = inject(AuthService);
  userRole:Role|undefined = this.authService.userRole()
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

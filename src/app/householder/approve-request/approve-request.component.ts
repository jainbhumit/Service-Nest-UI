import { Component, inject } from '@angular/core';
import { ApproveRequests } from '../../models/service.model';
import { HouseholderService } from '../../services/householder.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';
import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import { ConfirmCancelRequestComponentComponent } from '../confirm-cancel-request-component/confirm-cancel-request-component.component';
import { AddReviewFormComponent } from '../add-review-form/add-review-form.component';

@Component({
  selector: 'app-approve-request',
  templateUrl: './approve-request.component.html',
  styleUrl: './approve-request.component.scss'
})
export class ApproveRequestComponent {
  approveRequests: ApproveRequests[] = [];
  filteredRequests: ApproveRequests[] = [];
  selectedStatus: string = '';
  private householderService = inject(HouseholderService);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);

  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;

  ngOnInit(): void {
    this.loadApproveRequests();
  }

  loadApproveRequests(): void {
    this.householderService
      .viewApprovedRequest(this.itemsPerPage, this.currentPage)
      .subscribe({
        next: (response) => {
          if (response.message === 'No service request found') {
            console.log('No service Request Found');
            this.approveRequests = [];
          } else {
            this.approveRequests = response.data;
            this.applyStatusFilter();
            this.apiResponseEnd = response.data.length < this.itemsPerPage;
          }
        },
        error: (err) => {
          console.log(err.error.message);
        },
      });
  }
  applyStatusFilter(): void {
    console.log(this.selectedStatus,this.approveRequests);
    if (this.selectedStatus == 'New to Old') {
      this.filteredRequests = this.approveRequests.sort((a, b) => {
        const dateA = new Date(a.requested_time).getTime();
        const dateB = new Date(b.requested_time).getTime();
        return dateB - dateA;
      })
    } else if (this.selectedStatus == 'Old to New') {
      this.filteredRequests = this.approveRequests.sort((a, b) => {
        const dateA = new Date(a.requested_time).getTime();
        const dateB = new Date(b.requested_time).getTime();
        return dateA - dateB;
      })
    } else {
      this.filteredRequests = this.approveRequests
    }
  }
  formatDate(dateString: string): string {
    dateString = dateString.replace('T', ' ');
    dateString = dateString.replace('Z', '');
    const newDateTime: string = this.datePipe.transform(dateString, 'M/d/yyyy, h:mm:ss a') || '';
    return newDateTime;
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadApproveRequests();
  }

  updateRequest(requestId: string, scheduleTime: string) {
    const dialog = this.dialog.open(EditRequestDialogComponent, {
      width: '450px',
      data: { request_id: requestId, scheduled_time: scheduleTime }
    });
  }
  cancelRequest(requestId: string) {
    console.log('On Cancel');
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '500px',
      data: { request_id: requestId }
    });
    dialog.afterClosed().subscribe((response) => {
      if (response) {
        this.householderService.cancelServiceRequest(requestId).subscribe({
          next: (response) => {
            if (response.message == 'Request cancelled successfully') {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
            }
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message })
        });
      }
    })
  }

  onBack() {
    this.router.navigate(['/householder/home']);
  }

  onStatusChange() {
    this.applyStatusFilter();
  }

  LeaveReview(providerId:string|undefined, serviceId:string) {
    const dialogRef = this.dialog.open(AddReviewFormComponent,{
      width: '450px',
      data: {service_id:serviceId,provider_id:providerId}
    })
  }
}

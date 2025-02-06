import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';

import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import { ConfirmCancelRequestComponentComponent } from '../confirm-cancel-request-component/confirm-cancel-request-component.component';
import { AddReviewFormComponent } from '../add-review-form/add-review-form.component';
import { AcceptServiceDialogComponent } from '../../provider/accept-service-dialog/accept-service-dialog.component';

import { HouseholderService } from '../../services/householder.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { ApproveRequests } from '../../models/service.model';
import { Role } from '../../config';

@Component({
  selector: 'app-approve-request',
  templateUrl: './approve-request.component.html',
  styleUrl: './approve-request.component.scss',
})
export class ApproveRequestComponent {
  filteredRequests: ApproveRequests[] = [];
  selectedStatus: string = '';
  userRole: string | undefined;
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private householderService = inject(HouseholderService);
  private dialog = inject(MatDialog);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);

  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.userRole = this.authService.userRole();
    if (this.userRole === 'Admin') {
      const dialogRef = this.dialog.open(AcceptServiceDialogComponent, {
        width: '450px',
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.loadApproveRequests();
        }
      });
    } else {
      this.loadApproveRequests();
    }
  }

  loadApproveRequests(): void {
    this.isLoading = true;
    if (this.userRole === Role.householder) {
      this.householderService
        .viewApprovedRequest(
          this.itemsPerPage,
          this.currentPage,
          this.selectedStatus
        )
        .subscribe({
          next: (response) => {
            if (response.message === 'No service request found') {
              console.log('No service Request Found');
              this.filteredRequests = [];
            } else {
              this.filteredRequests = response.data;
              this.apiResponseEnd = response.data.length < this.itemsPerPage;
            }
            this.isLoading = false;

          },
          error: (err) => {
            this.isLoading = false;
            console.log(err.error.message);
          },
        });
    } else {
      this.adminService
        .viewApprovedRequest(
          this.itemsPerPage,
          this.currentPage,
          this.selectedStatus
        )
        .subscribe({
          next: (response) => {
            if (response.message === 'No service request found') {
              console.log('No service Request Found');
              this.filteredRequests = [];
            } else {
              this.filteredRequests = response.data;
              this.apiResponseEnd = response.data.length < this.itemsPerPage;
            }
            this.isLoading = false;

          },
          error: (err) => {
            this.isLoading = false;
            console.log(err.error.message);
          },
        });
    }
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadApproveRequests();
  }

  updateRequest(requestId: string, scheduleTime: string) {
    const dialog = this.dialog.open(EditRequestDialogComponent, {
      width: '450px',
      data: { request_id: requestId, scheduled_time: scheduleTime },
    });
  }
  cancelRequest(requestId: string,status:string) {
    console.log('On Cancel');
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '500px',
      data: { request_id: requestId },
    });
    dialog.afterClosed().subscribe((response) => {
      if (response) {
        this.isLoading =true;
        if (this.userRole === Role.householder) {
          this.householderService.cancelServiceRequest(requestId,status).subscribe({
            next: (response) => {
              if (response.message == 'Request cancelled successfully') {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message,
                });
              }
              this.isLoading = false;
            },
            error: (err) => {
              console.log(err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Not Allow',
                  detail: err.error.message,
                });
              this.isLoading = false;
            },
          });
        } else {
          this.adminService.cancelServiceRequest(requestId,status).subscribe({
            next: (response) => {
              if (response.message == 'Request cancelled successfully') {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message,
                });
              this.isLoading = false;
              }
            },
            error: (err) => {
              console.log(err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Not Allow',
                  detail: err.error.message,
                });
              this.isLoading = false;

            },
          });
        }
      }
    });
  }

  onBack() {
    if (this.userRole === Role.householder) {
      this.router.navigate(['/householder/home']);
    } else {
      this.router.navigate(['/admin/home']);
    }
  }

  onRefresh() {
    this.loadApproveRequests();
  }

  onStatusChange() {
    this.loadApproveRequests();
  }

  LeaveReview(providerId: string | undefined, serviceId: string,request_id:string) {
    const dialogRef = this.dialog.open(AddReviewFormComponent, {
      width: '450px',
      data: { service_id: serviceId, provider_id: providerId , request_id:request_id},
    });
  }

  canLeaveReview(scheduledTime: string): boolean {
    const currentTime = new Date();
    const scheduledDate = new Date("2025-01-31T13:00:00Z");
    
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const currentTimeIST = new Date(currentTime.getTime() + istOffset);
    const formattedCurrentTime = currentTimeIST.toISOString().slice(0, 19) + "Z"; 
    const formattedScheduledDate = scheduledDate.toISOString().slice(0, 19) + "Z";
    

    if (formattedCurrentTime > formattedScheduledDate) {
        return true;
    } else {
      return false;
    }
    
  }
}

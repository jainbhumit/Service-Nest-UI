import { Role } from './../../config';
import { Component, inject, OnInit, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MatDialog } from '@angular/material/dialog';

import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import { ConfirmCancelRequestComponentComponent } from '../confirm-cancel-request-component/confirm-cancel-request-component.component';
import { AcceptServiceDialogComponent } from '../../provider/accept-service-dialog/accept-service-dialog.component';

import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { Booking, EvaluatedKey, ProviderInfo } from '../../models/service.model';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-householder-request',
  templateUrl: './householder-request.component.html',
  styleUrl: './householder-request.component.scss',
})
export class HouseholderRequestComponent implements OnInit {
  filteredBookings: Booking[] = [];
  selectedStatus: string = '';
  private authService = inject(AuthService);
  private householderService = inject(HouseholderService);
  private dialog = inject(MatDialog);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);
  private adminService = inject(AdminService);
  userRole: string | undefined;
  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;
  lastEvaluatedKey: EvaluatedKey | null = null;
  previousKeys: EvaluatedKey[] = [];
  isLoading:boolean = false

  ngOnInit(): void {
    this.userRole = this.authService.userRole();
    if (this.userRole === 'Admin') {
      const dialogRef = this.dialog.open(AcceptServiceDialogComponent, {
        width: '450px',
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.loadBookings();
        }
      });
    } else {
      this.loadBookings();
    }
  }

  loadBookings(): void {
    this.isLoading = true;
    const encodedEvaluatedKey = this.lastEvaluatedKey ? this.lastEvaluatedKey : null
    if (this.userRole === Role.householder) {
      this.householderService
        .fetchBookings(this.itemsPerPage, encodedEvaluatedKey, this.selectedStatus)
        .subscribe({
          next: (response) => {
            if (response.message === 'No service request found') {
              this.filteredBookings = [];
            } else {
              this.filteredBookings = response.data.serviceRequests;
              this.lastEvaluatedKey = response.data.lastEvaluatedKey || null
              this.apiResponseEnd = response.data.serviceRequests.length < this.itemsPerPage;
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
        .fetchBookings(this.itemsPerPage, this.lastEvaluatedKey, this.selectedStatus)
        .subscribe({
          next: (response) => {
            if (response.message === 'No service request found') {
              this.filteredBookings = [];
            } else {
              this.filteredBookings = response.data.serviceRequests;
              this.lastEvaluatedKey = response.data.lastEvaluatedKey || null
              this.apiResponseEnd = response.data.serviceRequests.length < this.itemsPerPage;
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

  navigateToDetails(
    providerDetails: ProviderInfo[],
    requestId: string,
    status:string,
    serviceId:string
  ) {
    if ((providerDetails as []).length > 0) {
      const formatDetail: {
        request_id: string;
        status:string;
        service_id:string;
        provider_details: ProviderInfo[];
      } = {
        request_id: requestId,
        status:status,
        service_id:serviceId,
        provider_details: providerDetails as [],
      };
      this.householderService.currentAcceptRequestDetail.set(formatDetail);
      if (this.userRole === Role.householder) {
        this.router.navigate(['/householder/requests/accept']);
      } else {
        this.router.navigate(['/admin/requests/accept']);
      }
    }
  }

  onPageChange(newPage: number) {
    this.apiResponseEnd = false;
    this.currentPage = newPage;
    this.loadBookings();
  }
  nextPage() {
    if (this.lastEvaluatedKey) {
      this.previousKeys.push(this.lastEvaluatedKey);
      this.loadBookings();
    }
  }

  previousPage() {
    if (this.previousKeys.length > 0) {
      this.lastEvaluatedKey = this.previousKeys.pop() || null;
      this.loadBookings();
    }
  }
  updateRequest(requestId: string, scheduleTime: string,status:string) {
    const dialog = this.dialog.open(EditRequestDialogComponent, {
      width: '450px',
      data: { request_id: requestId, scheduled_time: scheduleTime ,status:status},
    });
    dialog.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.filteredBookings.map((curr) => {
            if (curr.request_id == requestId) curr.scheduled_time = res;
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'request update successfully',
          });
        }
      },
    });
  }
  cancelRequest(requestId: string,status:string) {
    console.log('On Cancel');
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '450px',
      data: { request_id: requestId },
    });
    dialog.afterClosed().subscribe((response) => {
      if (response) {
        this.isLoading = true;
        if (this.userRole === Role.householder) {
          this.householderService.cancelServiceRequest(requestId,status).subscribe({
            next: (response) => {
              if (response.message == 'Request cancelled successfully') {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message,
                });
                this.filteredBookings.map((curr) => {
                  if (curr.request_id == requestId) {
                    curr.status = 'Cancelled';
                  }
                });
              }else {
                this.messageService.add({
                  severity: 'warning',
                  summary: 'Not Allow',
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
                this.filteredBookings.map((curr) => {
                  if (curr.request_id == requestId) {
                    curr.status = 'Cancelled';
                  }
                });
              }
              this.isLoading = false;

            },
            error: (err) => {
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

  onRefresh() {
    this.previousKeys = [];
    this.lastEvaluatedKey = null;
    this.loadBookings();
  }

  onBack() {
    if (this.userRole === Role.householder) {
      this.router.navigate(['/householder/home']);
    } else {
      this.router.navigate(['/admin/home']);
    }
  }
  onStatusChange() {
    this.previousKeys = [];
    this.lastEvaluatedKey = null;
    this.loadBookings();
  }
}

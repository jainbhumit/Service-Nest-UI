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
import { Booking, ProviderInfo } from '../../models/service.model';
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
    this.authService.isLoading.update(() => true);
    if (this.userRole === Role.householder) {
      this.householderService
        .fetchBookings(this.itemsPerPage, this.currentPage, this.selectedStatus)
        .subscribe({
          next: (response) => {
            if (response.message === 'No service request found') {
              this.filteredBookings = [];
            } else {
              this.filteredBookings = response.data;
              this.apiResponseEnd = response.data.length < this.itemsPerPage;
            }
          },
          error: (err) => {
            console.log(err.error.message);
          },
        });
    } else {
      this.adminService
        .fetchBookings(this.itemsPerPage, this.currentPage, this.selectedStatus)
        .subscribe({
          next: (response) => {
            if (response.message === 'No service request found') {
              this.filteredBookings = [];
            } else {
              this.filteredBookings = response.data;
              this.apiResponseEnd = response.data.length < this.itemsPerPage;
            }
          },
          error: (err) => {
            console.log(err.error.message);
          },
        });
    }
    this.authService.isLoading.update(() => false);
  }

  navigateToDetails(
    providerDetails: ProviderInfo[],
    requestId: string
  ) {
    if ((providerDetails as []).length > 0) {
      const formatDetail: {
        request_id: string;
        provider_details: ProviderInfo[];
      } = {
        request_id: requestId,
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

  updateRequest(requestId: string, scheduleTime: string) {
    const dialog = this.dialog.open(EditRequestDialogComponent, {
      width: '450px',
      data: { request_id: requestId, scheduled_time: scheduleTime },
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
  cancelRequest(requestId: string) {
    console.log('On Cancel');
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '450px',
      data: { request_id: requestId },
    });
    dialog.afterClosed().subscribe((response) => {
      if (response) {
        this.authService.isLoading.update(() => true);
        if (this.userRole === Role.householder) {
          this.householderService.cancelServiceRequest(requestId).subscribe({
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
            },
            error: (err) => {
              console.log(err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Not Allow',
                  detail: err.error.message,
                });
            },
          });
        } else {
          this.adminService.cancelServiceRequest(requestId).subscribe({
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
            },
            error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Not Allow',
                  detail: err.error.message,
                });
            },
          });
        }
        this.authService.isLoading.update(() => false);
      }
    });
  }

  onRefresh() {
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
    this.loadBookings();
  }
}

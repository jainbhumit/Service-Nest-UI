import { Component, inject, OnInit } from '@angular/core';
import { Booking } from '../../models/service.model';
import { HouseholderService } from '../../services/householder.service';
import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmCancelRequestComponentComponent } from '../confirm-cancel-request-component/confirm-cancel-request-component.component';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-householder-request',
  templateUrl: './householder-request.component.html',
  styleUrl: './householder-request.component.scss',
})
export class HouseholderRequestComponent implements OnInit {
  paginatedBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedStatus: string = '';
  private householderService = inject(HouseholderService);
  private dialog= inject(MatDialog);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);

  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.householderService
      .fetchBookings(this.itemsPerPage, this.currentPage, '')
      .subscribe({
        next: (response) => {
          if (response.message === 'No service request found') {
            console.log('No service Request Found');
            this.paginatedBookings = [];
          } else {
            this.paginatedBookings = response.data;
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
    this.filteredBookings = this.selectedStatus
    ? this.paginatedBookings.filter((booking) => booking.status === this.selectedStatus)
    : this.paginatedBookings;
  }
  
  formatDate(dateString: string): string {
    dateString = dateString.replace('T',' ');
    dateString = dateString.replace('Z','');
    const newDateTime:string = this.datePipe.transform(dateString, 'M/d/yyyy, h:mm:ss a') || '' ;
    return newDateTime;
  }
  navigateToDetails(providerDetails:Booking["provider_details"],requestId:string) {
    if ((providerDetails as []).length>0) {
      const formatDetail:{request_id:string,provider_details:Booking["provider_details"][]} = {
        request_id:requestId,
        provider_details:providerDetails as []
      }
      this.householderService.currentAcceptRequestDetail.set(formatDetail);
      console.log(this.householderService.currentAcceptRequestDetail());
      this.router.navigate(['/householder/requests/accept'])

    }
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadBookings();
  }

  updateRequest(requestId:string,scheduleTime:string) {
    const dialog = this.dialog.open(EditRequestDialogComponent,{
      width:'450px',
      data:{request_id:requestId,scheduled_time:scheduleTime}
    });
  }
  cancelRequest(requestId:string) {
    console.log('On Cancel');
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent,{
      width: '500px',
      data: {request_id:requestId}
    });
    dialog.afterClosed().subscribe((response) => {
      if (response) {
        this.householderService.cancelServiceRequest(requestId).subscribe({
          next: (response) => {
            if (response.message == 'Request cancelled successfully') {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message});
            }
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message})
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
}

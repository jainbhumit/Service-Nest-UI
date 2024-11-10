import { Component, inject, OnInit } from '@angular/core';
import { Booking } from '../../models/service.model';
import { HouseholderService } from '../../services/householder.service';
import { EditRequestDialogComponent } from '../edit-request-dialog/edit-request-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmCancelRequestComponentComponent } from '../confirm-cancel-request-component/confirm-cancel-request-component.component';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AcceptServiceDialogComponent } from '../../provider/accept-service-dialog/accept-service-dialog.component';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../config';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-householder-request',
  templateUrl: './householder-request.component.html',
  styleUrl: './householder-request.component.scss',
})
export class HouseholderRequestComponent implements OnInit {
  paginatedBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedStatus: string = '';
  private authService = inject(AuthService)
  private householderService = inject(HouseholderService);
  private dialog= inject(MatDialog);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);
  private adminService = inject(AdminService);
  userRole:string|undefined;
  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;

  ngOnInit(): void {
    this.userRole = this.authService.userRole(); 
    if(this.userRole==='Admin') {
      const dialogRef = this.dialog.open(AcceptServiceDialogComponent,{
        width:'450px',
      })
      dialogRef.afterClosed().subscribe((res) =>{
        if(res) {
          this.loadBookings();
        }
      })
    }else {
      this.loadBookings();
    }
    
  }

  loadBookings(): void {
    console.log(this.userRole);
    if(this.userRole===Role.householder) {
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
    }else{
      this.adminService
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
   
  }
  applyStatusFilter(): void {
    this.filteredBookings = this.selectedStatus
    ? this.paginatedBookings.filter((booking) => booking.status === this.selectedStatus)
    : this.paginatedBookings;
  }
  
  navigateToDetails(providerDetails:Booking["provider_details"],requestId:string) {
    if ((providerDetails as []).length>0) {
      const formatDetail:{request_id:string,provider_details:Booking["provider_details"][]} = {
        request_id:requestId,
        provider_details:providerDetails as []
      }
      this.householderService.currentAcceptRequestDetail.set(formatDetail);
      console.log(this.householderService.currentAcceptRequestDetail());
      if(this.userRole===Role.householder) {
        this.router.navigate(['/householder/requests/accept'])
      }else {
        this.router.navigate(['/admin/requests/accept'])
        
      }

    }
  }

  onPageChange(newPage: number) {
    this.apiResponseEnd = false;
    this.currentPage = newPage;
    this.loadBookings();
  }

  updateRequest(requestId:string,scheduleTime:string) {
    const dialog = this.dialog.open(EditRequestDialogComponent,{
      width:'450px',
      data:{request_id:requestId,scheduled_time:scheduleTime}
    });
    dialog.afterClosed().subscribe({
      next:(res)=>{
        this.filteredBookings.map((curr) =>{
          if (curr.request_id==requestId) 
            curr.scheduled_time=res;
        })
        this.messageService.add({severity:'success',summary:'Success',detail:'request update successfully'})
      }
    })
  }
  cancelRequest(requestId:string) {
    console.log('On Cancel');
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent,{
      width: '450px',
      data: {request_id:requestId}
    });
    dialog.afterClosed().subscribe((response) => {
      if (response) {
        console.log(this.adminService.userId);
        if(this.userRole===Role.householder) {
          this.householderService.cancelServiceRequest(requestId).subscribe({
            next: (response) => {
              if (response.message == 'Request cancelled successfully') {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message});
                this.filteredBookings.map((curr) => {
                  if (curr.request_id==requestId) {
                    curr.status='Cancelled';
                  }
                })
              }
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message})
          });
        } else {
          this.adminService.cancelServiceRequest(requestId).subscribe({
            next: (response) => {
              if (response.message == 'Request cancelled successfully') {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message});
                this.filteredBookings.map((curr) => {
                  if (curr.request_id==requestId) {
                    curr.status='Cancelled';
                  }
                })
              }
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message})
          });
        }
     
      }
    })
  }

  onBack() {
    if(this.userRole===Role.householder) {
      this.router.navigate(['/householder/home']);
    }else {
      this.router.navigate(['/admin/home']);
      
    }
  }

  onStatusChange() {
    this.applyStatusFilter();
  }
}

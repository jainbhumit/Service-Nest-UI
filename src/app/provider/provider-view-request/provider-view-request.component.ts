import { Component, inject } from '@angular/core';
import { Booking, ProviderViewRequest } from '../../models/service.model';
import { HouseholderService } from '../../services/householder.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EditRequestDialogComponent } from '../../householder/edit-request-dialog/edit-request-dialog.component';
import { ConfirmCancelRequestComponentComponent } from '../../householder/confirm-cancel-request-component/confirm-cancel-request-component.component';
import { ProviderService } from '../../services/provider.service';
import { AcceptServiceDialogComponent } from '../accept-service-dialog/accept-service-dialog.component';

@Component({
  selector: 'app-provider-view-request',
  templateUrl: './provider-view-request.component.html',
  styleUrl: './provider-view-request.component.scss'
})
export class ProviderViewRequestComponent {
  paginatedRequest: ProviderViewRequest[] = [];
  private providerService = inject(ProviderService);
  private dialog= inject(MatDialog);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);

  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.providerService
      .viewServiceRequest(this.itemsPerPage, this.currentPage)
      .subscribe({
        next: (response) => {
          if (response.message === 'No pending service requests available') {
            console.log('No service Request Found');
            this.paginatedRequest = [];
            this.apiResponseEnd = true;
          } else {
            this.paginatedRequest = response.data;
            this.apiResponseEnd = response.data.length < this.itemsPerPage;
          }
        },
        error: (err) => {
          console.log(err.error.message);
        },
      });
  }

  formatDate(dateString: string): string {
    dateString = dateString.replace('T',' ');
    dateString = dateString.replace('Z','');
    const newDateTime:string = this.datePipe.transform(dateString, 'M/d/yyyy, h:mm:ss a') || '' ;
    return newDateTime;
  }


  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadRequests();
  }

  acceptRequest(requestId: string) {
    const dialogRef = this.dialog.open(AcceptServiceDialogComponent, {
      width:'450px',
      data:{request_id:requestId}
    })

    dialogRef.afterClosed().subscribe({
      next: (res) => {
        if(res) {
          this.messageService.add({severity:'success',summary:"Success",detail:"Service added successfully"})
        }
      }
    })
  }

  onBack() {
    this.router.navigate(['/provider/home']);
  }

}

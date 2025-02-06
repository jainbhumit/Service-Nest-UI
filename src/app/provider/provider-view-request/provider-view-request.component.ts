import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ProviderViewRequest } from '../../models/service.model';
import { AcceptServiceDialogComponent } from '../accept-service-dialog/accept-service-dialog.component';
import { ProviderService } from '../../services/provider.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-provider-view-request',
  templateUrl: './provider-view-request.component.html',
  styleUrl: './provider-view-request.component.scss',
})
export class ProviderViewRequestComponent {
  paginatedRequest: ProviderViewRequest[] = [];
  private providerService = inject(ProviderService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;
  selectedStatus: string = '';
  categories = new Map<string, string>();
  isLoading: boolean =false;

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.fetchCategories().subscribe({
      next: (response) => {
        response.data.map((category) => {
          this.categories.set(category.id, category.name);
        });
        console.log(this.categories);
        this.isLoading = false
      },
      error: (err) => {
        console.log(err.error.message)
        this.isLoading = false;
      },
    });
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.providerService
      .viewServiceRequest(this.itemsPerPage, this.currentPage,this.selectedStatus)
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
         this.isLoading = false;

        },
        error: (err) => {
         this.isLoading = false;
          console.log(err.error.message);
        },
      });
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadRequests();
  }

  acceptRequest(requestId: string,service_id:string,status:string) {
    const dialogRef = this.dialog.open(AcceptServiceDialogComponent, {
      width: '450px',
      data: { request_id: requestId , service_id:service_id,status:status},
    });

    dialogRef.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loadRequests();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service added successfully',
          });
        }
      },
    });
  }

  onBack() {
    this.router.navigate(['/provider/home']);
  }

  onRefresh() {
    this.loadRequests();
  }

  onStatusChange() {
    this.loadRequests();
  }
}

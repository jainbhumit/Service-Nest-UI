import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ConfirmCancelRequestComponentComponent } from '../../householder/confirm-cancel-request-component/confirm-cancel-request-component.component';
import { AuthService } from '../../services/auth.service';
import { ProviderServiceDetail } from '../../models/service.model';
import { AdminService } from '../../services/admin.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-services',
  templateUrl: './view-services.component.html',
  styleUrl: './view-services.component.scss',
})
export class ServicesComponent {
  paginatedServices: ProviderServiceDetail[] = [];
  filteredServices: ProviderServiceDetail[] = [];
  selectedStatus: string = '';
  isLoading:boolean = false;
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);
  private adminService = inject(AdminService);
  categories = new Map<string, string>();
  userRole: string | undefined;
  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;


  ngOnInit(): void {
    this.isLoading = true;
    this.userService.fetchCategories().subscribe({
      next: (response) => {
        response.data.map((category) => {
          this.categories.set(category.id, category.name);
        });
        this.selectedStatus = Array.from(this.categories.keys())[0];
        this.onStatusChange();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err.error.message)
      },
    });
  }

  loadServices(): void {
    this.isLoading = true;
    console.log("Selected Status 1",this.selectedStatus);
    this.adminService
      .fetchServices(this.itemsPerPage, this.currentPage,this.selectedStatus)
      .subscribe({
        next: (response) => {
          if (response.message === 'No service request found') {
            console.log('No service Request Found');
            this.filteredServices = [];
          } else {
            this.filteredServices = response.data;
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

  applyStatusFilter(): void {
    // this.filteredServices = this.selectedStatus
    //   ? this.paginatedServices.filter(
    //       (category) => category.category == this.selectedStatus
    //     )
    //   : this.paginatedServices;
    this.loadServices();
  }

  deactivateAccount(providerId: string) {
    const dialogRef = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;
        this.adminService.deactivateAccount(providerId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message,
            });
            this.isLoading = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message,
            });
            this.isLoading = false;
          },
        });
      }
    });
  }
  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadServices();
  }
  onBack() {
    this.router.navigate(['/admin/home']);
  }

  onStatusChange() {
    this.applyStatusFilter();
  }
}

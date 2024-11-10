import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HouseholderService } from '../../services/householder.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ProviderServiceDetail } from '../../models/service.model';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdminService } from '../../services/admin.service';
import { UserService } from '../../services/user.service';
import { ConfirmCancelRequestComponentComponent } from '../../householder/confirm-cancel-request-component/confirm-cancel-request-component.component';

@Component({
  selector: 'app-services',
  templateUrl: './view-services.component.html',
  styleUrl: './view-services.component.scss',
})
export class ServicesComponent {
  paginatedServices: ProviderServiceDetail[] = [];
  filteredServices: ProviderServiceDetail[] = [];
  selectedStatus: string = '';
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
    this.userService.fetchCategories().subscribe({
      next: (response) => {
        response.data.map((category) => {
          this.categories.set(category.id, category.name);
        });
        console.log(this.categories);
      },
      error: (err) => console.log(err.error.message),
    });
    this.loadServices();
  }

  loadServices(): void {
    this.adminService
      .fetchServices(this.itemsPerPage, this.currentPage)
      .subscribe({
        next: (response) => {
          if (response.message === 'No service request found') {
            console.log('No service Request Found');
            this.paginatedServices = [];
          } else {
            this.paginatedServices = response.data;
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
    this.filteredServices = this.selectedStatus
      ? this.paginatedServices.filter(
          (category) => category.category == this.selectedStatus
        )
      : this.paginatedServices;
  }

  deactivateAccount(providerId: string) {
   const dialogRef = this.dialog.open(ConfirmCancelRequestComponentComponent,{
    width:'450px'
   })
   dialogRef.afterClosed().subscribe((res) =>{
    if(res) {
      this.adminService.deactivateAccount(providerId).subscribe({
        next:(response) => {
          this.messageService.add({severity:'success',summary:'Success',detail:response.message});
        },
        error:(err) =>{
          this.messageService.add({severity:'error',summary:'Error',detail:err.error.message});
        }
      })
    }
   })
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

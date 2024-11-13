import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Route, Router } from '@angular/router';

import { ConfirmCancelRequestComponentComponent } from '../confirm-cancel-request-component/confirm-cancel-request-component.component';
import { AdminAddCategoryComponent } from '../../admin/admin-add-category/admin-add-category.component';

import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { ServiceCategory } from '../../models/service.model';
import { GetServiceImage } from '../../util/image.url';

@Component({
  selector: 'app-householder-home',
  templateUrl: './householder-home.component.html',
  styleUrl: './householder-home.component.scss',
})
export class HouseholderHomeComponent {
  categories: ServiceCategory[] = [];
  filteredServices: ServiceCategory[] = [];
  searchTerm: string = '';
  role: string | undefined;
  private dialog = inject(MatDialog);
  constructor(
    private authService: AuthService,
    private householderService: HouseholderService,
    private adminService: AdminService,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.authService.isLoading.update(()=>true);
    this.role = this.authService.userRole();
    this.fetchCategories()
    this.authService.isLoading.update(()=>false);
  }

  fetchCategories() {
    this.userService.fetchCategories().subscribe({
      next: (response) => {
        if (response.status === 'Success') {
          this.categories = response.data;
          this.filteredServices = this.categories;
        }
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }
  filterServices(): void {
    this.filteredServices = this.categories.filter((category) =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getServiceImg(serviceName: string): string {
    return GetServiceImage(serviceName);
  }

  onServiceClick(service: ServiceCategory): void {
    this.userService.currentService.set(service);
    if (this.role === 'Householder') {
      this.router.navigate([`householder/category`]);
    } else if (this.role === 'Admin') {
      this.router.navigate(['admin/category']);
    }
  }

  deleteCategory(categoryId: string) {
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '450px',
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.authService.isLoading.update(()=>true);
        this.adminService.deleteService(categoryId).subscribe({
          next: (response) => {
            if (response.message == 'Service deleted successfully') {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Service delete successfully',
              });
              this.filteredServices = this.filteredServices.filter(
                (category) => category.id != categoryId
              );
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message,
            });
          },
        });
        this.fetchCategories();
        this.authService.isLoading.update(()=>false);
      }
    });
  }

  addCategory() {
    const dialogRef = this.dialog.open(AdminAddCategoryComponent, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if(res) {
        this.fetchCategories();
      }
    })
  }

  LogOut() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  getRouterLink(path: string): string {
    if (this.role === 'Householder') {
      return `/householder/${path}`;
    } else if (this.role === 'ServiceProvider') {
      return `/provider/${path}`;
    } else {
      return `/admin/${path}`;
    }
  }
}

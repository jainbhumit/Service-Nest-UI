import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AddServiceFormComponent } from './../../provider/add-service-form/add-service-form.component';
import { RequestServiceFormComponent } from '../../householder/request-service-form/request-service-form.component';
import { ConfirmCancelRequestComponentComponent } from '../../householder/confirm-cancel-request-component/confirm-cancel-request-component.component';
import { AcceptServiceDialogComponent } from '../../provider/accept-service-dialog/accept-service-dialog.component';

import { UserService } from './../../services/user.service';
import { GetServiceImage } from '../../util/image.url';
import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { ProviderService } from '../../services/provider.service';
import { ProviderDetail, ServiceCategory } from '../../models/service.model';
import { Role } from '../../config';
import { ProviderServiceDetail } from './../../models/service.model';

@Component({
  selector: 'app-householder-category',
  templateUrl: './request-category.component.html',
  styleUrl: './request-category.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RequestCategoryComponent implements OnInit {
  currentService: ServiceCategory = {
    name: '',
    id: '',
    description: '',
  };
  isLoading: boolean = false;
  isServiceAdded: boolean = false;
  serviceDetail: ProviderServiceDetail[] = [];
  availableProviders: number = 0;
  avgPrice: number = 0;
  providers: ProviderDetail[] = [];
  userRole: Role | undefined;
  userId: string = '';
  private providerService = inject(ProviderService);
  constructor(
    private router: Router,
    private userService: UserService,
    private householderService: HouseholderService,
    private authService: AuthService,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.authService.isLoading.update(() => true);
    this.userRole = this.authService?.userRole();
    this.currentService = this.userService.currentService();
    if (this.userRole === Role.householder || this.userRole === Role.admin) {
      this.householderService
        .getServiceByCategory(this.currentService.name)
        .subscribe({
          next: (response) => {
            if (response.data && response.data.length > 0) {
              this.availableProviders = response.data.length;
              this.avgPrice =
                response.data.reduce((acc, curr) => {
                  this.providers.push({
                    name: curr.provider_name,
                    rating: curr.avg_rating,
                    price: curr.price,
                  });
                  return (acc += curr.price);
                }, 0) / response.data.length;
            }
          },
          error: (err) => {
            console.log(err.error.message);
          },
        });
    } else if (this.userRole === 'ServiceProvider') {
      this.loadProviderService();
    }
    this.authService.isLoading.update(() => false);
  }

  getServiceImg(serviceName: string): string {
    return GetServiceImage(serviceName);
  }
  loadProviderService() {
    this.authService.isLoading.update(() => true);
    this.providerService.getProviderService().subscribe({
      next: (response) => {
        if (response.data) {
          response.data.map((service) => {
            if (service.category == this.currentService.name) {
              this.isServiceAdded = true;
            }
          });
          this.serviceDetail = response.data;
          this.providerService.serviceDetail = this.serviceDetail;
        }
      },
    });
    this.authService.isLoading.update(() => false);
  }
  selectCategory(category: string) {
    this.router.navigate(['/services'], {
      queryParams: { category: category.toLowerCase() },
    });
  }
  requestService() {
    if (this.userRole === 'Admin') {
      const dialogRef = this.dialog.open(AcceptServiceDialogComponent, {
        width: '450px',
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          const dialogRef = this.dialog.open(RequestServiceFormComponent, {
            width: '450px',
            data: { category: this.currentService.name },
          });
        }
      });
    } else {
      const dialogRef = this.dialog.open(RequestServiceFormComponent, {
        width: '450px',
        data: { category: this.currentService.name },
      });
    }
  }
  onBack() {
    if (this.userRole === 'Householder') {
      this.router.navigate(['/householder/home']);
    }
    if (this.userRole === 'ServiceProvider') {
      this.router.navigate(['/provider/home']);
    }
    if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/home']);
    }
  }
  addService() {
    if (this.isServiceAdded) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Service already added',
      });
      return;
    }
    const dialog = this.dialog.open(AddServiceFormComponent, {
      width: '450px',
      data: { category: this.currentService.name, is_update: false },
    });
    dialog.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loadProviderService();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service Added Succesfully',
          });
        }
      },
    });
  }

  updateService(service: ProviderServiceDetail) {
    const dialog = this.dialog.open(AddServiceFormComponent, {
      width: '450px',
      data: {
        category: this.currentService.name,
        is_update: true,
        service_detail: service,
      },
    });
    dialog.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.loadProviderService();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service update Succesfully',
          });
        }
      },
    });
  }
  cancelService(serviceId: string) {
    const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent, {
      width: '450px',
      data: { is_provider: true },
    });
    dialog.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.authService.isLoading.update(() => true);
          this.providerService.deleteService(serviceId).subscribe({
            next: (response) => {
              this.loadProviderService();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Service cancel Succesfully',
              });
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error cancelling service',
              });
            },
          });
          this.authService.isLoading.update(() => false);
        }
      },
    });
  }

  getRouterLink(path: string): string {
    if (this.userRole === 'Householder') {
      return `/householder/${path}`;
    } else if (this.userRole === 'ServiceProvider') {
      return `/provider/${path}`;
    } else {
      return `/admin/${path}`;
    }
  }
}

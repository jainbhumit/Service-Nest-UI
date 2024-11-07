import { Component, OnInit } from '@angular/core';
import { BaseUrl, Role } from '../../config';
import { ProviderDetail, ServiceCategory } from '../../models/service.model';
import { GetServiceImage } from '../../util/image.url';
import { Router } from '@angular/router';
import { HouseholderService } from '../../services/householder.service';
import { MatDialog } from '@angular/material/dialog';
import { RequestServiceFormComponent } from '../request-service-form/request-service-form.component';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-householder-category',
  templateUrl: './householder-category.component.html',
  styleUrl: './householder-category.component.scss',
})
export class HouseholderCategoryComponent implements OnInit {
  currentService: ServiceCategory = {
    name: '',
    id: '',
    description: '',
  };
  availableProviders: number = 0;
  avgPrice: number = 0;
  providers: ProviderDetail[]= [];
  userRole:Role | undefined; 

  constructor(
    private router: Router,
    private householderService: HouseholderService,
    private authService:AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.userRole = this.authService?.userRole();
    this.currentService = this.householderService.currentService();
    this.householderService
      .getServiceByCategory(this.currentService.name)
      .subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            this.availableProviders = response.data.length;
            this.avgPrice = response.data.reduce((acc, curr) => {
              this.providers.push({name:curr.provider_name,rating:curr.avg_rating,price:curr.price});
              return (acc += curr.price);
            }, 0) / response.data.length;
          }
        },
        error: (err) => {
          console.log(err.error.message);
        },
      });
  }

  getServiceImg(serviceName: string): string {
    return GetServiceImage(serviceName);
  }

  viewProfile() {
    this.router.navigate(['/profile']);
  }

  viewBookings() {
    this.router.navigate(['/bookings']);
  }

  viewServiceRequest() {
    this.router.navigate(['/service-requests']);
  }

  viewAcceptRequest() {
    this.router.navigate(['/accept-requests']);
  }

  viewApproveRequest() {
    this.router.navigate(['/approve-requests']);
  }

  requestService() {
    const dialogRef = this.dialog.open(RequestServiceFormComponent,{
      width: '450px',
      data: {category:this.currentService.name}
    })
  }

  selectCategory(category: string) {
    this.router.navigate(['/services'], {
      queryParams: { category: category.toLowerCase() },
    });
  }

  onBack() {
   this.router.navigate(['/householder/home']);
  }
}

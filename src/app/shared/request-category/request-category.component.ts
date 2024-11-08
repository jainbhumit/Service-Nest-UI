import { ProviderServiceDetail } from './../../models/service.model';
import { AddServiceFormComponent } from './../../provider/add-service-form/add-service-form.component';
import { UserService } from './../../services/user.service';
import { Component, inject, OnInit } from '@angular/core';
import { BaseUrl, Role } from '../../config';
import { ProviderDetail, ServiceCategory } from '../../models/service.model';
import { GetServiceImage } from '../../util/image.url';
import { Router } from '@angular/router';
import { HouseholderService } from '../../services/householder.service';
import { MatDialog } from '@angular/material/dialog';
import { RequestServiceFormComponent } from '../../householder/request-service-form/request-service-form.component';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProviderService } from '../../services/provider.service';
import { MessageService } from 'primeng/api';
import { ConfirmCancelRequestComponentComponent } from '../../householder/confirm-cancel-request-component/confirm-cancel-request-component.component';

@Component({
  selector: 'app-householder-category',
  templateUrl: './request-category.component.html',
  styleUrl: './request-category.component.scss',
})
export class RequestCategoryComponent implements OnInit {
  currentService: ServiceCategory = {
    name: '',
    id: '',
    description: '',
  };
  isServiceAdded:boolean = false; 
  serviceDetail:ProviderServiceDetail[] = [];
  availableProviders: number = 0;
  avgPrice: number = 0;
  providers: ProviderDetail[]= [];
  userRole:Role | undefined; 
  private providerService = inject(ProviderService)
  constructor(
    private router: Router,
    private userService: UserService,
    private householderService:HouseholderService,
    private authService:AuthService,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.userRole = this.authService?.userRole();
    this.currentService = this.userService.currentService();
    if(this.userRole==='Householder') {
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
    } else if(this.userRole==='ServiceProvider') {
        this.providerService.getProviderService().subscribe({
          next:(response) => {
            if (response.data) {
              response.data.map((service)=>{
                if (service.category==this.currentService.name) {
                  this.isServiceAdded = true;
                }
              })
              this.serviceDetail = response.data;
              this.providerService.serviceDetail = this.serviceDetail;
            }
            
          }
        })
    }
  }

  getServiceImg(serviceName: string): string {
    return GetServiceImage(serviceName);
  }

  selectCategory(category: string) {
    this.router.navigate(['/services'], {
      queryParams: { category: category.toLowerCase() },
    });
  }
  requestService() {
    const dialogRef = this.dialog.open(RequestServiceFormComponent,{
      width: '450px',
      data: {category:this.currentService.name}
    })
  }
  onBack() {
    if(this.userRole=='Householder') {
      this.router.navigate(['/householder/home']);
    }
    if(this.userRole == 'ServiceProvider') {
      this.router.navigate(['/provider/home']);
    }
  }
  addService() {
    if (this.isServiceAdded) {
      this.messageService.add({severity:'info',summary:'Info',detail:'Service already added'});
      return;
    }
    const dialog = this.dialog.open(AddServiceFormComponent,{
    width:'450px',
    data:{category:this.currentService.name,is_update:false}
   });
   dialog.afterClosed().subscribe({
    next: (res) => {
      if (res) {
        this.messageService.add({severity:'success',summary:'Success',detail:'Service Added Succesfully'})
      } 
    }
   })
  }

  updateService(service:ProviderServiceDetail) {
    const dialog = this.dialog.open(AddServiceFormComponent,{
      width:'450px',
      data:{category:this.currentService.name,is_update:true,service_detail:service}
     });
     dialog.afterClosed().subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({severity:'success',summary:'Success',detail:'Service update Succesfully'})
        } 
      }
     })
  }
    cancelService(serviceId:string) {
      const dialog = this.dialog.open(ConfirmCancelRequestComponentComponent,{
        width:'450px',
        data:{is_provider:true}
       });
       dialog.afterClosed().subscribe({
        next: (res) => {
          if (res) {
            this.providerService.deleteService(serviceId).subscribe({
              next: (response) => {
                this.messageService.add({severity:'success',summary:'Success',detail:'Service cancel Succesfully'});
              },
              error: (err)=> {
                this.messageService.add({severity:'error',summary:'Error',detail:'Error cancelling service'})
              }
            })
          } 
        }
       })
    }

    getRouterLink(path:string):string {
      if(this.userRole==='Householder') {
        return `/householder/${path}`;
      }else if(this.userRole==='ServiceProvider') {
        return `/provider/${path}`
      }else {
        return `/admin/${path}`;
      }
    }
}

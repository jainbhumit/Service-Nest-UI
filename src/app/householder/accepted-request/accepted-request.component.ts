import { Component, inject, OnInit } from '@angular/core';
import { Booking } from '../../models/service.model';
import { HouseholderService } from '../../services/householder.service';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accepted-request',
  templateUrl: './accepted-request.component.html',
  styleUrl: './accepted-request.component.scss'
})
export class AcceptedRequestComponent implements OnInit {
  providerDetail: Booking["provider_details"] = [];
  private householderService = inject(HouseholderService);
  private location = inject(Location);
  private messageService = inject(MessageService);
  private router:Router = inject(Router);
  selectedStatus: string = '';
  filteredProviderDetail: Booking["provider_details"] = [];
  apiResponseEnd: boolean = false;
  currentPage: number = 1;
  itemPerPage:number = 8;
  totalCount:number = 0;

  ngOnInit(): void {
    this.providerDetail = this.householderService.currentAcceptRequestDetail().provider_details as [];
    this.totalCount = this.householderService.currentAcceptRequestDetail().provider_details.length;
    this.applyPagination();
  }

  applyPagination() {
    const start = (this.currentPage - 1) * this.itemPerPage;
    const end = start + this.itemPerPage;
    this.filteredProviderDetail = this.providerDetail?.slice(start, end);
    this.apiResponseEnd = end >= this.totalCount;
  }
  onPageChange(newPage: number) {
    if (newPage < 1 || (newPage - 1) * this.itemPerPage >= this.totalCount) return;
    this.currentPage = newPage;
    this.applyPagination();
  }
  approveRequest(providerId: string) {
    const body:{request_id:string,provider_id:string} = {
      request_id:this.householderService.currentAcceptRequestDetail().request_id,
      provider_id:providerId
    }
    this.householderService.approveRequest(body).subscribe({
      next:(response) => {
        this.messageService.add({severity:'success',summary:'Success',detail:response.message})
      },
      error:(err) =>{
        this.messageService.add({severity:'error',summary:'Error',detail:err.error.message});
      }
    })

    this.location.back();
  }

  onStatusChange() {
    if (this.selectedStatus === 'Rating(high-low)') {
      this.providerDetail = this.providerDetail?.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.selectedStatus === 'Price(high-low)') {
      this.providerDetail = this.providerDetail?.slice().sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    this.currentPage = 1;
    this.applyPagination();
  }
  onBack() {
    this.location.back();
  }
}

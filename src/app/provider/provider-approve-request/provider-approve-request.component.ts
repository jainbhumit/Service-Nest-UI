import { Component, inject } from '@angular/core';
import { ProviderApproveRequest } from '../../models/service.model';
import { ProviderService } from '../../services/provider.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-provider-approve-request',
  templateUrl: './provider-approve-request.component.html',
  styleUrl: './provider-approve-request.component.scss'
})
export class ProviderApproveRequestComponent {
  approveRequests: ProviderApproveRequest[] = [];
  filteredRequests: ProviderApproveRequest[] = [];
  selectedStatus: string = '';
  private providerService = inject(ProviderService);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);

  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;

  ngOnInit(): void {
    this.loadApproveRequests();
  }

  loadApproveRequests(): void {
    this.providerService
      .viewApprovedRequest(this.itemsPerPage, this.currentPage)
      .subscribe({
        next: (response) => {
          if (response.status=='Fail' && response.message === 'no approved requests found for this provider') {
            this.approveRequests = [];
          } else {
            this.approveRequests = response.data;
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
    if (this.selectedStatus == 'Late') {
      this.filteredRequests = this.approveRequests.filter((request) => {
        const requestTime = new Date(request.scheduled_time).getTime();
        const currentTime = new Date().getTime();
        return currentTime > requestTime;
      });
    } else if (this.selectedStatus == 'Early') {
      this.filteredRequests = this.approveRequests.filter((request) => {
        const requestTime = new Date(request.scheduled_time).getTime();
        const currentTime = new Date().getTime();
        return currentTime < requestTime;
      });
    } else {
      this.filteredRequests = this.approveRequests;
    }
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadApproveRequests();
  }

  onBack() {
    this.router.navigate(['/provider/home']);
  }

  onStatusChange() {
    this.applyStatusFilter();
  }

}

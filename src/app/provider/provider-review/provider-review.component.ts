import { Component, inject } from '@angular/core';
import { ProviderReview } from '../../models/service.model';
import { ProviderService } from '../../services/provider.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-provider-review',
  templateUrl: './provider-review.component.html',
  styleUrl: './provider-review.component.scss',
})
export class ProviderReviewComponent {
  private providerService = inject(ProviderService);
  private userService = inject(UserService);
  private datePipe = inject(DatePipe);
  private router: Router = inject(Router);
  private messageService = inject(MessageService);

  providerReview: ProviderReview[] = [];
  filteredReview: ProviderReview[] = [];
  selectedStatus: string = '';
  categories = new Map<string, string>();
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
    this.loadReview();
  }

  loadReview(): void {
    this.providerService
      .getReview(this.itemsPerPage, this.currentPage)
      .subscribe({
        next: (response) => {
          if (
            response.status == 'Fail' &&
            response.message === 'no approved requests found for this provider'
          ) {
            this.providerReview = [];
          } else {
            this.providerReview = response.data;
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
    this.filteredReview = this.selectedStatus
      ? this.providerReview.filter(
          (category) => category.service_id == this.selectedStatus
        )
      : this.providerReview;
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.apiResponseEnd = false;
    this.loadReview();
  }

  onBack() {
    this.router.navigate(['/provider/home']);
  }

  onStatusChange() {
    this.applyStatusFilter();
  }
}

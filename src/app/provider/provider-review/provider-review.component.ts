import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { UserService } from '../../services/user.service';
import { ProviderService } from '../../services/provider.service';
import { ProviderReview } from '../../models/service.model';
import { AuthService } from '../../services/auth.service';

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
  private authService = inject(AuthService);

  providerReview: ProviderReview[] = [];
  filteredReview: ProviderReview[] = [];
  selectedStatus: string = '';
  categories = new Map<string, string>();
  currentPage = 1;
  itemsPerPage = 8;
  apiResponseEnd: boolean = false;

  ngOnInit(): void {
    this.authService.isLoading.update(() => true)
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
    this.authService.isLoading.update(() => false)
  }

  loadReview(): void {
    this.authService.isLoading.update(()=>true)
    this.providerService
      .getReview(this.itemsPerPage, this.currentPage,this.selectedStatus)
      .subscribe({
        next: (response) => {
          if (
            response.status == 'Fail' &&
            response.message === 'no reviews found'
          ) {
            this.filteredReview = [];
          } else {
            this.filteredReview = response.data;
            this.apiResponseEnd = response.data.length < this.itemsPerPage;
          }
        },
        error: (err) => {
          if(err.error.message=='no reviews found') {
            this.filteredReview = [];
          }
          console.log(err.error.message);
        },
      });
      this.authService.isLoading.update(() => false)
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
    this.loadReview();
  }

  onRefresh() {
    this.loadReview()
  }
}

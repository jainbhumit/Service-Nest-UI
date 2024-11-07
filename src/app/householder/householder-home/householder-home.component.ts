import { Component } from '@angular/core';
import { ServiceCategory } from '../../models/service.model';
import { HttpClient } from '@angular/common/http';
import { HouseholderService } from '../../services/householder.service';
import { GetServiceImage } from '../../util/image.url';
import { Route, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-householder-home',
  templateUrl: './householder-home.component.html',
  styleUrl: './householder-home.component.scss',
})
export class HouseholderHomeComponent {
  categories: ServiceCategory[] = [];
  filteredServices: ServiceCategory[] = [];
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private householderService: HouseholderService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.householderService.fetchCategories().subscribe({
      next: (response) => {
        if (response.status === 'Success') {
          this.categories = response.data;
          this.filteredServices = this.categories; // Initialize filtered services
        }
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  filterServices(): void {
    this.filteredServices = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getServiceImg(serviceName: string): string{
    return GetServiceImage(serviceName)
  }

  onServiceClick(service: ServiceCategory): void {
    console.log('Selected service:', service);
    this.householderService.currentService.set(service);
    console.log(this.householderService.currentService())
    this.router.navigate([`householder/category`])
  }

  LogOut() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}

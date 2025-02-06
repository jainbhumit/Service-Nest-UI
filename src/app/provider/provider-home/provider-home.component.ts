import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './../../services/user.service';
import { ServiceCategory } from '../../models/service.model';
import { AuthService } from '../../services/auth.service';
import { GetServiceImage } from '../../util/image.url';

@Component({
  selector: 'app-provider-home',
  templateUrl: './provider-home.component.html',
  styleUrl: './provider-home.component.scss',
})
export class ProviderHomeComponent {
  categories: ServiceCategory[] = [];
  filteredServices: ServiceCategory[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.fetchCategories().subscribe({
      next: (response) => {
        if (response.status === 'Success') {
          this.categories = response.data;
          this.filteredServices = this.categories;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err)
        this.isLoading = false;
      },
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
    console.log('Selected service:', service);
    this.userService.currentService.set(service);
    console.log(this.userService.currentService());
    this.router.navigate([`provider/category`]);
  }

  LogOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

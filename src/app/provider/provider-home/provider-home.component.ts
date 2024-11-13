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

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
    console.log('Selected service:', service);
    this.userService.currentService.set(service);
    console.log(this.userService.currentService());
    this.router.navigate([`provider/category`]);
  }

  LogOut() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}

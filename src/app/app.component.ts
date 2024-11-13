import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'serviceNest';
  private authService = inject(AuthService)
  loading = this.authService.isLoading;
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './shared/landing/landing.component';
import { LoginComponent } from './shared/login/login.component';
import { SignupComponent } from './shared/signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HouseholderHomeComponent } from './householder/householder-home/householder-home.component';
import {
  provideRouter,
  RouterLink,
  RouterOutlet,
  withComponentInputBinding,
} from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastModule } from 'primeng/toast';
import { TooltipModule} from 'primeng/tooltip'
import { MatIconModule } from '@angular/material/icon';

import { routes } from './app.routes';
import { ProviderHomeComponent } from './provider/provider-home/provider-home.component';
import {
  authInterceptor,
  authResponseInterceptor,
} from './intercepters/auth.intercepter';
import { ForgotPasswordComponent } from './shared/forgot-password/forgot-password.component';
import { RequestCategoryComponent } from './shared/request-category/request-category.component';
import { RequestServiceFormComponent } from './householder/request-service-form/request-service-form.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DatePipe } from '@angular/common';
import { ProfileComponent } from './shared/profile/profile.component';
import { HouseholderRequestComponent } from './householder/householder-request/householder-request.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { EditRequestDialogComponent } from './householder/edit-request-dialog/edit-request-dialog.component';
import { ConfirmCancelRequestComponentComponent } from './householder/confirm-cancel-request-component/confirm-cancel-request-component.component';
import { MessageService } from 'primeng/api';
import { InputOtpModule } from 'primeng/inputotp';

import { AcceptedRequestComponent } from './householder/accepted-request/accepted-request.component';
import { ApproveRequestComponent } from './householder/approve-request/approve-request.component';
import { AddReviewFormComponent } from './householder/add-review-form/add-review-form.component';
import { UnauthorisedComponent } from './shared/unauthorised/unauthorised.component';
import { AddServiceFormComponent } from './provider/add-service-form/add-service-form.component';
import { ProviderViewRequestComponent } from './provider/provider-view-request/provider-view-request.component';
import { ProviderApproveRequestComponent } from './provider/provider-approve-request/provider-approve-request.component';
import { ProviderReviewComponent } from './provider/provider-review/provider-review.component';
import { AcceptServiceDialogComponent } from './provider/accept-service-dialog/accept-service-dialog.component';
import { AdminAddCategoryComponent } from './admin/admin-add-category/admin-add-category.component';
import { ServicesComponent } from './admin/view-services/view-services.component';
import { DateTimePipe } from './pipes/date-time.pipe';
import { AveragePipe } from './pipes/average.pipe';
import { NoDataFoundComponent } from './shared/no-data-found/no-data-found.component';
import { GenerateOtpComponent } from './shared/generate-otp/generate-otp.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';
import { FilterPipe } from './pipes/sanitize.pipe';
import { MatButtonModule, MatIconAnchor, MatIconButton } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent,
    SignupComponent,
    HouseholderHomeComponent,
    ProviderHomeComponent,
    ForgotPasswordComponent,
    RequestCategoryComponent,
    RequestServiceFormComponent,
    ProfileComponent,
    HouseholderRequestComponent,
    SpinnerComponent,
    EditRequestDialogComponent,
    ConfirmCancelRequestComponentComponent,
    AcceptedRequestComponent,
    ApproveRequestComponent,
    AddReviewFormComponent,
    UnauthorisedComponent,
    AddServiceFormComponent,
    ProviderViewRequestComponent,
    ProviderApproveRequestComponent,
    ProviderReviewComponent,
    AcceptServiceDialogComponent,
    AdminAddCategoryComponent,
    ServicesComponent,
    AveragePipe,
    FilterPipe,
    NoDataFoundComponent,
    GenerateOtpComponent,
    NotfoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterLink,
    RouterOutlet,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    ToastModule,
    DateTimePipe,
    TooltipModule,
    InputOtpModule
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useValue: { intercept: authInterceptor },
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useValue: { intercept: authResponseInterceptor },
      multi: true,
    },
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync('noop'),
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

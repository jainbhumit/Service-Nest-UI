import { Routes } from "@angular/router";
import { LandingComponent } from "./shared/landing/landing.component";
import { LoginComponent } from "./shared/login/login.component";
import { SignupComponent } from "./shared/signup/signup.component";
import { HouseholderHomeComponent } from "./householder/householder-home/householder-home.component";
import { ProviderHomeComponent } from "./provider/provider-home/provider-home.component";
import { authGuard } from "./guards/auth.guard";
import { ForgotPasswordComponent } from "./shared/forgot-password/forgot-password.component";
import { HouseholderCategoryComponent } from "./householder/householder-category/householder-category.component";
import { ProfileComponent } from "./shared/profile/profile.component";
import { HouseholderRequestComponent } from "./householder/householder-request/householder-request.component";
import { AcceptedRequestComponent } from "./householder/accepted-request/accepted-request.component";
// import { acessGuard } from "./guards/access.guard";
import { ApproveRequestComponent } from "./householder/approve-request/approve-request.component";
import { UnauthorisedComponent } from "./shared/unauthorised/unauthorised.component";
import { accessGuard } from "./guards/access.guard";

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'forgot',
    component: ForgotPasswordComponent
  },
  {
    path: 'user/profile',
    component: ProfileComponent,
  },
  {
    path: 'unauthorized',
    component: UnauthorisedComponent
  },
  {
    path: 'householder',
    canActivateChild: [authGuard],
    children: [
      {
        path: 'home',
        component: HouseholderHomeComponent,
      },
      {
        path: 'category',
        component: HouseholderCategoryComponent,
        canActivate: [new accessGuard('/householder/home').acessGuard]
      },
      {
        path: 'requests',
        children: [
          {
            path: '',
            component: HouseholderRequestComponent
          },
          {
            path: 'accept',
            component: AcceptedRequestComponent,
            canActivate: [new accessGuard('/householder/requests').acessGuard]
          }
        ]
      },
      {
        path: 'approve',
        component: ApproveRequestComponent,
      }
    ]
  },
  {
    path: 'provider',
    canActivateChild: [authGuard],
    children: [
      {
        path: 'home',
        component: ProviderHomeComponent,
      },
      {
        path: 'category',
        component: HouseholderCategoryComponent
      },
    ]
  },
] 
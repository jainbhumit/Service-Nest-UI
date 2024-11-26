import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { signal } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

class MockAuthService {
  isLoading = signal<boolean>(false)
}
describe('AppComponent', () => {
  let mockAuthService:MockAuthService = new MockAuthService();
  let mockMessageService = jasmine.createSpyObj('MessageService',['add'])
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToastModule,
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers:[
        {provide:AuthService,useValue:mockAuthService},
        {provide:MessageService,useValue:mockMessageService}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'serviceNest'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddReviewFormComponent } from './add-review-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HouseholderService } from '../../services/householder.service';
import { AuthService } from '../../services/auth.service';
import { Review } from '../../models/service.model';
import { signal } from '@angular/core';
import { MatFormField, MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockAuthService {
  isLoading = signal<boolean>(false);
}
describe('AddReviewFormComponent', () => {
  let component: AddReviewFormComponent;
  let fixture: ComponentFixture<AddReviewFormComponent>;
  let householderServiceMock: jasmine.SpyObj<HouseholderService>;
  let authServiceMock: MockAuthService;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddReviewFormComponent>>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    householderServiceMock = jasmine.createSpyObj('HouseholderService', ['addReview']);
    authServiceMock = new MockAuthService();
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [AddReviewFormComponent],
      imports: [ReactiveFormsModule, FormsModule,MatDialogModule,MatInputModule,MatButtonModule,MatFormFieldModule,BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { service_id: '123', provider_id: '456' } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: HouseholderService, useValue: householderServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.addReviewForm.value).toEqual({ comment: '', rating: '' });
    expect(component.addReviewForm.valid).toBeFalse();
  });

  it('should mark the form as invalid if fields are empty or invalid', () => {
    component.addReviewForm.setValue({ comment: '', rating: '6' });
    expect(component.addReviewForm.valid).toBeFalse();
  });

  it('should mark the form as valid if all fields are correctly filled', () => {
    component.addReviewForm.setValue({ comment: 'Great service!', rating: '5' });
    expect(component.addReviewForm.valid).toBeTrue();
  });

  it('should call addReview on submit when form is valid', () => {
    const review: Review = {
      service_id: '123',
      provider_id: '456',
      review_text: 'Great service!',
      rating: 5,
      request_id: ''
    };
    component.addReviewForm.setValue({ comment: review.review_text, rating: review.rating });
    householderServiceMock.addReview.and.returnValue(of({ status:'success',message: 'Review added successfully!' }));

    component.onSubmit();

    expect(householderServiceMock.addReview).toHaveBeenCalledWith(review);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Review added successfully!',
    });
    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(authServiceMock.isLoading()).toBe(false);
  });

  it('should handle errors gracefully on submit', () => {
    component.addReviewForm.setValue({ comment: 'Good service!', rating: '4' });
    householderServiceMock.addReview.and.returnValue(
      throwError({ error: { message: 'review already exists for this provider, service, and householder' } })
    );

    component.onSubmit();

    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Information',
      detail: 'Review already added',
    });
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should close the dialog on cancel', () => {
    component.onCancel();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});

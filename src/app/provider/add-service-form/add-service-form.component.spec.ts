import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { AddServiceFormComponent } from './add-service-form.component';
import { ProviderService } from './../../services/provider.service';
import { ProviderServiceDetail } from '../../models/service.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

describe('AddServiceFormComponent', () => {
  let component: AddServiceFormComponent;
  let fixture: ComponentFixture<AddServiceFormComponent>;
  let mockProviderService: jasmine.SpyObj<ProviderService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  const mockServiceDetail: ProviderServiceDetail = {
    id: '123',
    name: 'Test Service',
    description: 'Test Description',
    price: 100,
    category: 'Cleaning',
    provider_id: 'provider123',
    avg_rating: 4,
    rating_count: '10',
    category_id: '1'
  };

  const mockDialogData = {
    category: 'Cleaning',
    is_update: false,
    service_detail: mockServiceDetail
  };

  beforeEach(async () => {
    mockProviderService = jasmine.createSpyObj('ProviderService', ['addService', 'updateService']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ AddServiceFormComponent ],
      imports: [ ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
        FormsModule,
        BrowserModule ],
      providers: [
        { provide: ProviderService, useValue: mockProviderService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AddServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values for new service', () => {
      expect(component.addServiceForm.get('name')?.value).toBe('');
      expect(component.addServiceForm.get('description')?.value).toBe('');
      expect(component.addServiceForm.get('price')?.value).toBe('');
      expect(component.addServiceForm.get('category')?.value).toBe('Cleaning');
    });

    it('should set isUpdate flag based on dialog data', () => {
      expect(component.isUpdate).toBeFalse();
    });
  });

  describe('Update Mode', () => {
    beforeEach(() => {
      const updateMockData = {
        ...mockDialogData,
        is_update: true
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [ AddServiceFormComponent ],
        imports: [ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          NoopAnimationsModule,
          FormsModule,
          BrowserModule
        ],
        providers: [
          { provide: ProviderService, useValue: mockProviderService },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: updateMockData }
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AddServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
    });

    it('should populate form with existing service details in update mode', () => {
      expect(component.addServiceForm.get('name')?.value).toBe(mockServiceDetail.name);
      expect(component.addServiceForm.get('description')?.value).toBe(mockServiceDetail.description);
      expect(component.addServiceForm.get('price')?.value).toBe(mockServiceDetail.price);
      expect(component.addServiceForm.get('category')?.value).toBe(mockServiceDetail.category);
    });

    it('should set isUpdate flag to true', () => {
      expect(component.isUpdate).toBeTrue();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AddServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should be invalid when empty', () => {
      expect(component.addServiceForm.valid).toBeFalsy();
    });

    it('should be valid when all fields are filled', () => {
      component.addServiceForm.patchValue({
        name: 'Test Service',
        description: 'Test Description',
        price: '100',
        category: 'Cleaning'
      });
      expect(component.addServiceForm.valid).toBeTruthy();
    });

    it('should require name field', () => {
      const nameControl = component.addServiceForm.get('name');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AddServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should call addService when submitting new service', () => {
      const newService = {
        name: 'New Service',
        description: 'New Description',
        price: 150,
        category: 'Cleaning'
      };

      mockProviderService.addService.and.returnValue(of({status:'success', message: 'success',data:{service_id:'1'} }));

      component.addServiceForm.patchValue(newService);
      component.onSubmit();

      expect(mockProviderService.addService).toHaveBeenCalledWith(newService);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle addService error', () => {
      const errorResponse = { error: { status:"fail",message: 'Error adding service' } };
      mockProviderService.addService.and.returnValue(
        throwError(() =>errorResponse)
      );

      component.addServiceForm.patchValue({
        name: 'New Service',
        description: 'New Description',
        price: 150,
        category: 'Cleaning'
      });
      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should call updateService when updating existing service', () => {
      component.isUpdate = true;
      const updatedService = {
        name: 'Updated Service',
        description: 'Updated Description',
        price: 200,
        category: 'Cleaning'
      };

      mockProviderService.updateService.and.returnValue(of({ status:'success',message: 'success' }));

      component.addServiceForm.patchValue(updatedService);
      component.data.service_detail.id = '123';
      component.onSubmit();

      expect(mockProviderService.updateService).toHaveBeenCalledWith(updatedService, '123');
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle updateService error', () => {
      component.isUpdate = true;
      mockProviderService.updateService.and.returnValue(
        throwError(() => new Error('Error updating service'))
      );

      component.addServiceForm.patchValue({
        name: 'Updated Service',
        description: 'Updated Description',
        price: '200',
        category: 'Cleaning'
      });
      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Dialog Actions', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AddServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should close dialog on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(mockProviderService.addService).not.toHaveBeenCalled();
      expect(mockProviderService.updateService).not.toHaveBeenCalled();
    });
  });
});
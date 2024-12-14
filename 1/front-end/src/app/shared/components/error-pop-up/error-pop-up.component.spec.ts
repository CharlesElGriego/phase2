import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '../../services';
import { ErrorPopUpComponent } from './error-pop-up.component';
import { of } from 'rxjs';

describe('ErrorPopUpComponent', () => {
  let component: ErrorPopUpComponent;
  let fixture: ComponentFixture<ErrorPopUpComponent>;
  let notificationService: NotificationService;

  const mockNotificationService = {
    show: of(true), // Mock observable for showing the error popup
    message: of('Test error message'), // Mock observable for the error message
    closeError: jest.fn(), // Mock closeError function
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPopUpComponent],
      providers: [{ provide: NotificationService, useValue: mockNotificationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPopUpComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the error message', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Expect the error message to be displayed
    const errorMessageElement = compiled.querySelector('p');
    expect(errorMessageElement?.textContent).toContain('Test error message');
  });

  it('should call closeError on close button click', () => {
    const closeButton = fixture.nativeElement.querySelector('button');
    closeButton.click();

    // Verify that the closeError method was called
    expect(notificationService.closeError).toHaveBeenCalledTimes(1);
  });
});

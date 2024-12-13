import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show error and update message and show observables', () => {
    const testError = { code: 'test/error', message: 'This is a test error' };

    service.showError(testError);

    service.show.subscribe((show) => {
      expect(show).toBeTruthy();
    });

    service.message.subscribe((message) => {
      expect(message).toBe(testError.message);
    });
  });

  it('should close the error and reset message and show observables', () => {
    service.closeError();

    service.show.subscribe((show) => {
      expect(show).toBeFalsy();
    });

    service.message.subscribe((message) => {
      expect(message).toBeNull();
    });
  });

  it('should properly emit and reset values', () => {
    const testError = { code: 'test/error', message: 'This is a test error' };

    // Trigger error
    service.showError(testError);
    expect(service.show.value).toBeTruthy();
    expect(service.message.value).toBe(testError.message);

    // Close error
    service.closeError();
    expect(service.show.value).toBeFalsy();
    expect(service.message.value).toBeNull();
  });
});
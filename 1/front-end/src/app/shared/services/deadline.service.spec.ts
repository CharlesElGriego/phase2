import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Deadline } from '../models';
import { DeadlineService } from './deadline.service';

describe('DeadlineService', () => {
  let service: DeadlineService;
  let httpMock: HttpTestingController;

  const mockDeadline: Deadline = {
    secondsLeft: 120,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeadlineService],
    });

    service = TestBed.inject(DeadlineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch deadline from the API', () => {
    service.getDeadline().subscribe(deadline => {
      expect(deadline).toEqual(mockDeadline);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/deadline`);
    expect(req.request.method).toBe('GET');

    req.flush(mockDeadline);
  });

  it('should calculate and emit the correct deadline date', () => {
    service.getDeadline().subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/deadline`);
    req.flush(mockDeadline);

    service.getDeadlineDate().subscribe(deadlineDate => {
      const now = new Date();
      const expectedDeadlineDate = new Date(now.getTime() + mockDeadline.secondsLeft * 1000);

      // Remove millisecond precision for comparison
      expect(deadlineDate?.toISOString().split('.')[0]).toEqual(
        expectedDeadlineDate.toISOString().split('.')[0]
      );
    });
  });

  it('should return a countdown observable', done => {
    service.getCountdown().subscribe(secondsLeft => {
      expect(secondsLeft).toBeLessThanOrEqual(mockDeadline.secondsLeft);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/deadline`);
    req.flush(mockDeadline);
  });

  it('should stop the countdown when secondsLeft reaches 0', done => {
    const mockShortDeadline: Deadline = { secondsLeft: 3 }; // Simulate a short deadline
    service.getCountdown().subscribe({
      next: secondsLeft => {
        expect(secondsLeft).toBeGreaterThanOrEqual(0);
      },
      complete: () => {
        done(); // Complete when countdown finishes
      },
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/deadline`);
    req.flush(mockShortDeadline);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeadlineService } from '../shared/services';
import { DeadlineComponent } from './deadline.component';
import { of } from 'rxjs';

describe('DeadlineComponent', () => {
  let component: DeadlineComponent;
  let fixture: ComponentFixture<DeadlineComponent>;

  const mockDeadlineService = {
    getCountdown: jest.fn(),
    getDeadlineDate: jest.fn(),
  };

  beforeEach(async () => {
    mockDeadlineService.getCountdown.mockReturnValue(of(42)); // Mock countdown observable
    mockDeadlineService.getDeadlineDate.mockReturnValue(of(new Date('2024-12-31T18:00:00Z'))); // Mock deadline date observable

    await TestBed.configureTestingModule({
      imports: [DeadlineComponent],
      providers: [{ provide: DeadlineService, useValue: mockDeadlineService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCountdown and getDeadlineDate on initialization', () => {
    expect(mockDeadlineService.getCountdown).toHaveBeenCalledTimes(1);
    expect(mockDeadlineService.getDeadlineDate).toHaveBeenCalledTimes(1);
  });

  it('should update secondsLeft$ observable correctly', done => {
    component.secondsLeft$.subscribe(secondsLeft => {
      expect(secondsLeft).toBe(42);
      done();
    });
  });
});

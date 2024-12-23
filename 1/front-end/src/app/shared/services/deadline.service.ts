import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Deadline } from '../models';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeadlineService {
  private readonly apiUrl = `${environment.apiBaseUrl}/deadline`;
  private readonly deadlineDateSubject = new BehaviorSubject<Date | null>(null);
  constructor(private readonly http: HttpClient) {}

  // Fetch deadline from the server
  getDeadline(): Observable<Deadline> {
    return this.http
      .get<Deadline>(this.apiUrl)
      .pipe(tap(data => this.setDeadlineDate(data.secondsLeft)));
  }

  getCountdown(): Observable<number> {
    return this.getDeadline().pipe(
      switchMap(data =>
        timer(0, 1000).pipe(
          // Starts immediately and emits every second
          map(elapsedSeconds => Math.max(data.secondsLeft - elapsedSeconds, 0)), // Prevent negative values
          takeWhile(secondsLeft => secondsLeft > 0, true), // Emit `0` once and complete
          distinctUntilChanged() // Eliminate consecutive duplicate emissions
        )
      ),
      shareReplay(1) // Share the latest value across subscribers
    );
  }

  getDeadlineDate(): Observable<Date | null> {
    return this.deadlineDateSubject.asObservable();
  }

  private setDeadlineDate(secondsLeft: number): void {
    const now = new Date();
    const deadlineDate = new Date(now.getTime() + secondsLeft * 1000);
    this.deadlineDateSubject.next(deadlineDate);
  }
}

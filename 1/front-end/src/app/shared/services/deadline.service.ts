import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Deadline } from '../models';
import { BehaviorSubject, interval, map, Observable, startWith, switchMap, takeWhile, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeadlineService {
  private readonly apiUrl = `${environment.apiBaseUrl}/deadline`;
  private readonly deadlineDateSubject = new BehaviorSubject<Date | null>(null);
  constructor(private readonly http: HttpClient) {}

  // Fetch deadline from the server
  getDeadline(): Observable<Deadline> {
    return this.http.get<Deadline>(this.apiUrl).pipe(
      tap((data) => this.setDeadlineDate(data.secondsLeft)),
    );
  }

  getCountdown(): Observable<number> {
    return this.getDeadline().pipe(
      switchMap(data =>
        interval(1000).pipe(
          startWith(0), // Emit immediately
          map(elapsedSeconds => data.secondsLeft - elapsedSeconds), // Directly emit the countdown value
          takeWhile(secondsLeft => secondsLeft > 0) // Stop at 0
        )
      )
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

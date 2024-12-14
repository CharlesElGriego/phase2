import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationService } from './shared/services';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleHttpError(error);
        return throwError(() => error);
      })
    );
  }

  private handleHttpError(error: HttpErrorResponse) {
    // Server-side error
    let message = error.error?.message || error.statusText || 'An unknown error occurred.';
    if (error.status === 0) {
      message =
        'Network error: Unable to reach the server. Please ensure your internet connection is stable and the server is online.';
    }
    this.notificationService.showError({
      code: `server/error-${error.status}`,
      message,
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private authBaseUrl = 'http://localhost:5273/api'; // Cambia por tu backend real

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la solicitud:', error);
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status} - ${error.error?.message || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    // En login no enviamos token en headers
    return this.http.post(`${this.authBaseUrl}/auth/user/session`, credentials)
      .pipe(catchError(this.handleError));
  }


  register(userData: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.authBaseUrl}/auth/user`, userData, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  resetPassword(email: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.authBaseUrl}/auth/user/update-pass`,
      { email, newPassword },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  googleLogin(idToken: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.authBaseUrl}/auth/google-login`,
      { idToken },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getUserProfile(): Observable<{ email: string; username?: string }> {
    return this.http.get<{ email: string; username?: string }>(`${this.authBaseUrl}/auth/user/profile`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }
}

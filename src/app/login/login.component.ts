import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  showPassword = false;
  rememberMe = false;
  errorMessage = '';
  isLoading = false;

  private loginSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      this.loginForm.patchValue({
        email: credentials.email,
        password: credentials.password
      });
      this.rememberMe = true;
    }
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Función para decodificar payload JWT sin librerías
  private decodeJwtPayload(token: string): any {
    try {
      const payloadBase64Url = token.split('.')[1];
      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al decodificar token JWT', e);
      return null;
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.rememberMe) {
      localStorage.setItem('rememberedCredentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('rememberedCredentials');
    }

    this.loginSubscription = this.apiService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        const token = response.token;
        localStorage.setItem('auth_token', token);

        // Decodifica el JWT sin librería externa
        const decoded = this.decodeJwtPayload(token);

        if (decoded) {
          // Extrae rol
          const role =
            decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            decoded['role'];
          if (role) {
            localStorage.setItem('role', role);
          }

          // Extrae username
          const username =
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            decoded['username'] ||
            decoded['name'] ||
            response.username;
          if (username) {
            localStorage.setItem('username', username);
          }

          // Extrae ID usuario
          const userId =
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            decoded['sub'] ||
            decoded['id'];
          if (userId) {
            localStorage.setItem('user_id', userId.toString());
          }

          // Redirige según rol
          if (role === 'cliente') {
            this.router.navigate(['/cliente/home']);
          } else if (role === 'proveedor') {
            this.router.navigate(['/proveedor/home']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          this.errorMessage = 'Token inválido, no se pudo decodificar.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        this.errorMessage =
          error.error?.message || 'Credenciales inválidas. Por favor, inténtelo de nuevo.';
      }
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }
}

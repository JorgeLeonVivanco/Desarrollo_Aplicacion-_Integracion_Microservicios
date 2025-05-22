// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private TOKEN_KEY = 'auth_token'; // clave para almacenar token en localStorage

  constructor(private router: Router) { }

  logout(): void {
    // Eliminar token u otra info de sesión
    localStorage.removeItem(this.TOKEN_KEY);
    // Redirigir al login o pantalla pública
    this.router.navigate(['/login']);
  }

  // Opcional: método para saber si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Opcional: método para guardar token después del login
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Opcional: método para obtener token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}

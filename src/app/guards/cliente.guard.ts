import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const clienteGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role === 'cliente') {
    return true;
  }

  // Redirige a login y bloquea acceso
  router.navigate(['/login']);
  return false;
};

import { CanActivateFn } from '@angular/router';

export const proveedorGuard: CanActivateFn = (route, state) => {
  const role = localStorage.getItem('role');
  if (role === 'proveedor') {
    return true;
  }
  // Redirigir o bloquear acceso
  // Por ejemplo, redirigir al login:
  window.alert('No tienes permisos para acceder a esta ruta.');
  window.location.href = '/login';
  return false;
};

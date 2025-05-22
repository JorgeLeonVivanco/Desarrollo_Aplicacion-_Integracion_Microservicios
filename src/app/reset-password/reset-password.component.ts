import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasSpecialChar: false
  };
  private subscription = new Subscription();

  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.passwordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.passwordForm.get('newPassword')?.valueChanges.subscribe(val => {
      this.passwordRequirements = {
        minLength: val?.length >= 8,
        hasUppercase: /[A-Z]/.test(val),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)
      };
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.passwordForm.patchValue({ email: params['email'] });
      }
      // Si necesitas token, guárdalo aquí para enviarlo junto con la petición
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get emailControl() {
    return this.passwordForm.get('email');
  }

  get passwordControl() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
  this.passwordForm.markAllAsTouched();

  if (this.passwordForm.invalid) {
    return;
  }

  if (!this.passwordRequirements.minLength ||
    !this.passwordRequirements.hasUppercase ||
    !this.passwordRequirements.hasSpecialChar) {
    this.errorMessage = 'La contraseña no cumple con todos los requisitos';
    return;
  }

  const { email, newPassword } = this.passwordForm.value;
  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Llamada a la API para restablecer la contraseña
  const resetSub = this.apiService.resetPassword(email, newPassword).subscribe({
    next: () => {
      this.isLoading = false;
      this.successMessage = 'Contraseña restablecida correctamente. Redirigiendo al login...';
      
      // Mostrar mensaje de éxito y redirigir al login después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error.error?.message || error.message || 'No se pudo restablecer la contraseña. Por favor, inténtelo nuevamente.';
    }
  });

  this.subscription.add(resetSub);
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

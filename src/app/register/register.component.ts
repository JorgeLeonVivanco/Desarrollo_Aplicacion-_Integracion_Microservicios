import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  showForm = false;  // controla si mostrar formulario o la pantalla inicial
  showPassword = false;
  signupForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
      ]]
    });
  }

  toggleShowForm() {
    this.showForm = true;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get passwordControl() {
    return this.signupForm.get('password');
  }

  get passwordRequirements() {
    return {
      minLength: this.passwordControl?.errors?.['minlength'],
      hasUppercase: !/(?=.*[A-Z])/.test(this.passwordControl?.value || ''),
      hasSpecialChar: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.passwordControl?.value || '')
    };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, email, password } = this.signupForm.value;
    const userData = { username, email, password };

    this.subscription = this.apiService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || '¡Cuenta creada exitosamente!';
        this.signupForm.reset();
        // Opcional: redirigir tras registro
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || error.message || 'Error al crear la cuenta.';
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

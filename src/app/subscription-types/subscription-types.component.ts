import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SubscriptionService } from '../services/subscription.service'; // Ajusta ruta

interface SubscriptionPlan {
  name: string;
  price: number;
  benefits: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-subscription-types',
  templateUrl: './subscription-types.component.html',
  styleUrls: ['./subscription-types.component.scss']
})
export class SubscriptionTypesComponent {
  subscriptionPlans: SubscriptionPlan[] = [
    {
      name: 'Básico',
      price: 9.99,
      benefits: [
        'Acceso limitado a contenido',
        'Soporte por correo electrónico',
        '1 dispositivo simultáneo'
      ]
    },
    {
      name: 'Estándar',
      price: 19.99,
      benefits: [
        'Acceso completo a contenido',
        'Soporte prioritario',
        '3 dispositivos simultáneos',
        'Descarga offline'
      ],
      recommended: true
    },
    {
      name: 'Premium',
      price: 29.99,
      benefits: [
        'Acceso total y exclusivo',
        'Soporte 24/7',
        'Dispositivos ilimitados',
        'Contenido exclusivo y eventos especiales'
      ]
    }
  ];

  selectedPlan?: SubscriptionPlan;
  paymentForm: FormGroup;
  paymentProcessing = false;

  currentUserId = Number(localStorage.getItem('user_id')) || 0;
  currentUserName = localStorage.getItem('username') || '';

  paymentError = '';

  constructor(private fb: FormBuilder, private subscriptionService: SubscriptionService) {
    this.paymentForm = this.fb.group({
      nombre_tarjetahabiente: [this.currentUserName, [Validators.required, this.nombreValidator]],
      numero_tarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      fecha_expiracion: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/), this.fechaExpiracionValida]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  nombreValidator(control: AbstractControl): ValidationErrors | null {
    const valor = control.value as string;
    if (!valor) return null;
    const regex = /^[a-zA-ZÀ-ÿ\s'.-]+$/;
    return regex.test(valor) ? null : { nombreInvalido: true };
  }

  fechaExpiracionValida(control: AbstractControl): ValidationErrors | null {
    const valor = control.value as string;
    if (!valor) return null;

    const [mesStr, anioStr] = valor.split('/');
    const mes = parseInt(mesStr, 10);
    const anio = 2000 + parseInt(anioStr, 10);

    if (isNaN(mes) || isNaN(anio)) return { fechaInvalida: true };
    if (mes < 1 || mes > 12) return { fechaInvalida: true };

    const hoy = new Date();
    const fechaExp = new Date(anio, mes - 1, 1);

    return fechaExp >= new Date(hoy.getFullYear(), hoy.getMonth(), 1) ? null : { fechaExpirada: true };
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
    this.paymentError = '';
    this.paymentForm.reset({
      nombre_tarjetahabiente: this.currentUserName,
      numero_tarjeta: '',
      fecha_expiracion: '',
      cvv: '',
    });
  }

  cancelSelection(): void {
    this.selectedPlan = undefined;
    this.paymentError = '';
    this.paymentForm.reset();
  }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.paymentForm.get('numero_tarjeta')?.setValue(input.value, { emitEvent: false });
  }

  formatExpirationDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    input.value = value;
    this.paymentForm.get('fecha_expiracion')?.setValue(value, { emitEvent: false });
  }

  onCvvInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 3);
    this.paymentForm.get('cvv')?.setValue(input.value, { emitEvent: false });
  }

  processPayment(): void {
    if (!this.selectedPlan) return;

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    // Limpia nombre permitiendo solo letras y espacios
    const nombre = this.paymentForm.value.nombre_tarjetahabiente.trim().replace(/[^a-zA-Z\s]/g, '');

    const paymentData = {
      id_usuario: this.currentUserId,
      tipo_contenido: 'libros',
      periodo: 'mensual',
      monto: this.selectedPlan.price,
      metodo_pago: 'tarjeta',
      nombre_tarjetahabiente: nombre,
      numero_tarjeta: this.paymentForm.value.numero_tarjeta,
      fecha_expiracion: this.paymentForm.value.fecha_expiracion,
      cvv: this.paymentForm.value.cvv,
    };

    this.paymentProcessing = true;
    this.paymentError = '';

    this.subscriptionService.procesarPago(paymentData).subscribe({
      next: (response) => {
        this.paymentProcessing = false;
        alert('Pago procesado correctamente: ' + response.mensaje);
        this.cancelSelection();
      },
      error: (error) => {
        this.paymentProcessing = false;

        if (error.status === 422 && error.error) {
          if (error.error.errores) {
            this.paymentError = Object.entries(error.error.errores)
              .map(([campo, mensajes]) => `${campo}: ${(mensajes as string[]).join(', ')}`)
              .join(' | ');
          } else if (error.error.mensaje) {
            this.paymentError = error.error.mensaje;
          } else {
            this.paymentError = JSON.stringify(error.error);
          }
        } else {
          this.paymentError = error.message || 'Error procesando el pago. Intenta nuevamente.';
        }

        console.error('Error procesando pago:', error);
      }
    });
  }
}

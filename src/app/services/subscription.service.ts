// src/app/services/subscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  // Cambia esta URL si tu Laravel corre en otro host/puerto
  private apiBaseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Encabezados comunes para JSON
  private getHeaders() {
    const token = localStorage.getItem('auth_token'); // si usas auth
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      })
    };
  }

  // POST /pagos/procesar
  procesarPago(data: {
    id_usuario: number;
    tipo_contenido: string;
    periodo: string;
    monto: number;
    metodo_pago: string;
    nombre_tarjetahabiente: string;
    numero_tarjeta: string;
    fecha_expiracion: string;
    cvv: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiBaseUrl}/pagos/procesar`,
      data,
      this.getHeaders()
    );
  }

  // GET /suscripciones/estado/{id}
  consultarEstadoSuscripcion(idSuscripcion: number): Observable<any> {
    return this.http.get(
      `${this.apiBaseUrl}/suscripciones/estado/${idSuscripcion}`,
      this.getHeaders()
    );
  }

  // POST /cancelaciones/cancelar
  cancelarSuscripcion(data: {
    id_suscripcion: number;
    motivo: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiBaseUrl}/cancelaciones/cancelar`,
      data,
      this.getHeaders()
    );
  }

  // POST /suscripciones/renovar
  renovarSuscripcion(data: {
    id_usuario: number;
    id_suscripcion: number;
    periodo: string;
    monto: number;
    metodo_pago: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiBaseUrl}/suscripciones/renovar`,
      data,
      this.getHeaders()
    );
  }
}

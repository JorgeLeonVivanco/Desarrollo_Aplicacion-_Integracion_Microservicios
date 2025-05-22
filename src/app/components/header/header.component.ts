import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  username = 'Usuario';
  menuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  goToSettings(): void {
    console.log('Ir a configuración');
    // this.router.navigate(['/settings']);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username'); // También limpia el nombre si usas
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription-types']);
  }
}

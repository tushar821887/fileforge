import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component.js';
import { FooterComponent } from './components/footer/footer.component.js';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieConsentComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

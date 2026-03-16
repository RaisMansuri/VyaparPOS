import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // Application is now locked to light mode as per user request
    isDarkMode = signal<boolean>(false);

    constructor() {
        // No-op: Dark mode functionality removed
    }

    toggleTheme() {
        // No-op: Dark mode functionality removed
        console.warn('Theme switching is disabled.');
    }
}

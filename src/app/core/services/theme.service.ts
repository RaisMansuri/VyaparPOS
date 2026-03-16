import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'vyapar-pos-theme';
    private platformId = inject(PLATFORM_ID);
    isDarkMode = signal<boolean>(false);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            // Load persisted theme
            const savedTheme = localStorage.getItem(this.THEME_KEY);
            if (savedTheme) {
                this.isDarkMode.set(savedTheme === 'dark');
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.isDarkMode.set(prefersDark);
            }
        }

        // Apply theme effect
        effect(() => {
            const dark = this.isDarkMode();
            if (isPlatformBrowser(this.platformId)) {
                const element = document.querySelector('html');
                if (element) {
                    if (dark) {
                        element.classList.add('my-app-dark');
                    } else {
                        element.classList.remove('my-app-dark');
                    }
                }
                localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        this.isDarkMode.update(val => !val);
    }
}

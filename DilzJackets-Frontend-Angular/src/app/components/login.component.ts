import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="min-h-screen bg-jackets-matte flex items-center justify-center p-4 relative">
      <!-- Ambient Glow -->
      <div class="absolute w-[400px] h-[400px] bg-jackets-neon/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div class="bg-[#1a1a1a] border border-jackets-carbon rounded-xl max-w-md w-full p-8 shadow-2xl relative z-10">
        <div class="text-center mb-8">
          <!-- Brand Logo -->
          <div class="flex justify-center mb-4">
            <a routerLink="/" title="Return to homepage" class="group inline-block">
              <img src="assets/DilzJackets_Logo_web.png" 
                   alt="Dilz Jackets Logo" 
                   class="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_0_15px_rgba(255,69,0,0.35)] group-hover:scale-105 transition-transform" />
            </a>
          </div>
          <!-- Preserved CSS Styled Name Logo -->
          <h1 class="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
            DILZ <span class="text-jackets-neon">JACKETS</span>
          </h1>
          <div class="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-jackets-neon bg-jackets-neon/10 border border-jackets-neon/20 px-2.5 py-0.5 rounded-full mt-2.5">
            🔒 Admin Portal
          </div>
          <p class="text-xs text-gray-400 mt-2 font-medium">Authorized Personnel Only · 15-Minute Session</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div *ngIf="errorMessage()" class="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm text-center font-medium">
            {{ errorMessage() }}
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
            <input formControlName="username" type="text" placeholder="e.g. admin"
                   class="w-full bg-jackets-matte border border-jackets-carbon rounded-lg p-3 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input formControlName="password" type="password" placeholder="••••••••"
                   class="w-full bg-jackets-matte border border-jackets-carbon rounded-lg p-3 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading()"
                  class="w-full bg-jackets-neon hover:bg-[#e03e00] text-white font-black text-lg py-3 rounded-lg disabled:opacity-50 transition shadow-[0_0_15px_rgba(255,69,0,0.3)] cursor-pointer">
            {{ isLoading() ? 'AUTHENTICATING...' : 'SECURE LOGIN' }}
          </button>
        </form>

        <div class="mt-6 text-center border-t border-jackets-carbon pt-4">
          <a routerLink="/" class="text-xs text-gray-400 hover:text-jackets-neon transition inline-flex items-center gap-1.5 font-bold">
            ← Return to Homepage
          </a>
        </div>
      </div>
    </div>
    `
})

export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    onSubmit() {
        if (this.loginForm.invalid)
            return;

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const { username, password } = this.loginForm.value;

        this.authService.login({ username: username!, password: password! }).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']); //instantly route to dashboard on sucess

            },
            error: () => {
                this.isLoading.set(false);
                this.errorMessage.set('Invalid Credentials');
            }
        });

    }
}
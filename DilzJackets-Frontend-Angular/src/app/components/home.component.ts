import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AdminProductService, Product } from '../core/services/admin-product.service';
import { AuthService } from '../core/services/auth.service';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="min-h-screen bg-jackets-matte text-white">
      
      <!-- 0. High-Impact Brand Loading Screen Before Homepage is Loaded -->
      <div *ngIf="showLoadingScreen()" 
           [class.opacity-0]="isExitingLoadingScreen()"
           [class.scale-105]="isExitingLoadingScreen()"
           [class.pointer-events-none]="isExitingLoadingScreen()"
           class="fixed inset-0 z-50 bg-[#0c0c0c] flex flex-col items-center justify-center transition-all duration-700 ease-out select-none">
        
        <!-- Ambient Glowing Radial Halo -->
        <div class="absolute w-[450px] h-[450px] bg-jackets-neon/15 rounded-full blur-[140px] pointer-events-none"></div>

        <!-- Center Brand Container -->
        <div class="relative z-10 flex flex-col items-center text-center px-4">
          <!-- Logo with Breathing Neon Glow (Enlarged & Prominent) -->
          <div class="relative mb-6">
            <img src="assets/DilzJackets_Logo_web.png" 
                 alt="Dilz Jackets" 
                 class="w-36 h-36 md:w-48 md:h-48 object-contain animate-neon-pulse" />
          </div>

          <!-- Preserved CSS Styled Name Logo -->
          <div class="text-2xl md:text-3xl font-black tracking-tight uppercase leading-none drop-shadow">
            DILZ <span class="text-jackets-neon">JACKETS</span>
          </div>
          <div class="text-[10px] tracking-widest text-gray-400 font-bold uppercase mt-2">
            {{ currentLang() === 'SI' ? 'ශ්‍රී ලංකා යතුරුපැදි ඇඳුම් සහ වැහි කබා · රත්කරව්ව' : 'SRI LANKA · PREMIUM MOTORCYCLE APPAREL & WORKSHOP' }}
          </div>

          <!-- High-Tech Neon Loading Bar -->
          <div class="w-56 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mt-8 relative shadow-inner">
            <div class="h-full bg-gradient-to-r from-jackets-neon to-red-500 rounded-full shadow-[0_0_15px_rgba(255,69,0,0.8)] animate-loading-bar"></div>
          </div>

          <!-- Pulsing Status Text -->
          <div class="flex items-center gap-2 mt-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-jackets-neon animate-ping"></span>
            <span>{{ currentLang() === 'SI' ? 'ප්‍රදර්ශනාගාරය සූදානම් වෙමින් පවතී...' : 'Revving Up Showroom...' }}</span>
          </div>
        </div>
      </div>

      <!-- 1. Transparent Navigation Header (Auto-Hides on Scroll, Reappears with Opacity When Stopped) -->
      <header class="fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out"
              [ngClass]="headerClasses()">
        <div class="max-w-6xl mx-auto px-4 md:px-6 h-18 md:h-20 flex items-center justify-between">
          
          <!-- Logo & Brand (Enlarged Logo + Intact CSS Styled Name Logo) -->
          <a href="#" class="flex items-center gap-3 group">
            <img src="assets/DilzJackets_Logo_web.png" 
                 alt="Dilz Jackets Logo" 
                 class="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-[0_0_12px_rgba(255,69,0,0.35)] group-hover:scale-105 transition-transform" />
            <div>
              <div class="text-lg md:text-xl font-black tracking-tight uppercase leading-none drop-shadow">
                DILZ <span class="text-jackets-neon">JACKETS</span>
              </div>
              <div class="text-[9px] tracking-widest text-gray-400 font-bold uppercase drop-shadow">
                {{ t().brandCountry }}
              </div>
            </div>
          </a>

          <!-- Minimal Desktop Menu -->
          <nav class="hidden md:flex items-center gap-7">
            <a href="#showroom-section" class="text-xs uppercase font-bold text-gray-300 hover:text-white transition tracking-wider drop-shadow">{{ t().navCatalog }}</a>
            <a href="#why-us-section" class="text-xs uppercase font-bold text-gray-300 hover:text-white transition tracking-wider drop-shadow">{{ t().navWhy }}</a>
            <a href="#how-it-works-section" class="text-xs uppercase font-bold text-gray-300 hover:text-white transition tracking-wider drop-shadow">{{ t().navHow }}</a>
            <a href="#location-section" class="text-xs uppercase font-bold text-gray-300 hover:text-white transition tracking-wider drop-shadow">{{ t().navMap }}</a>
            <a href="#faq-section" class="text-xs uppercase font-bold text-gray-300 hover:text-white transition tracking-wider drop-shadow">{{ t().navFaq }}</a>
          </nav>

          <!-- Desktop Quick Actions -->
          <div class="hidden sm:flex items-center gap-3">
            <!-- Language Switcher -->
            <div class="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5 text-xs font-bold shadow-inner">
              <button type="button" 
                      (click)="setLang('EN')" 
                      [ngClass]="currentLang() === 'EN' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'"
                      class="px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-black">
                EN
              </button>
              <button type="button" 
                      (click)="setLang('SI')" 
                      [ngClass]="currentLang() === 'SI' ? 'bg-jackets-neon text-white shadow-sm' : 'text-gray-400 hover:text-white'"
                      class="px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-black">
                සිංහල
              </button>
            </div>

            <a [href]="'tel:' + PHONE_NUMBER" class="bg-gradient-to-r from-jackets-neon to-red-600 hover:brightness-110 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md shadow-orange-500/25">
              <span class="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <svg class="w-3 h-3 text-red-600 fill-current" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </span>
              <span>{{ t().call }}: {{ PHONE_NUMBER }}</span>
            </a>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button (click)="toggleMobileMenu()" 
                  type="button" 
                  aria-label="Toggle navigation menu"
                  class="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none cursor-pointer">
            <svg *ngIf="!isMobileMenuOpen()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
            <svg *ngIf="isMobileMenuOpen()" class="w-6 h-6 text-jackets-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Minimal Dropdown -->
        <div *ngIf="isMobileMenuOpen()" class="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 space-y-3 shadow-2xl">
          <!-- Mobile Language Switcher -->
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
            <span class="text-gray-400 font-medium">{{ t().languageLabel }}</span>
            <div class="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 font-bold">
              <button type="button" 
                      (click)="setLang('EN')" 
                      [ngClass]="currentLang() === 'EN' ? 'bg-white/20 text-white' : 'text-gray-400'"
                      class="px-3 py-1 rounded-lg transition-all text-xs font-black cursor-pointer">
                EN
              </button>
              <button type="button" 
                      (click)="setLang('SI')" 
                      [ngClass]="currentLang() === 'SI' ? 'bg-jackets-neon text-white' : 'text-gray-400'"
                      class="px-3 py-1 rounded-lg transition-all text-xs font-black cursor-pointer">
                සිංහල
              </button>
            </div>
          </div>

          <a (click)="closeMobileMenu()" href="#showroom-section" class="block text-sm font-semibold text-gray-300 hover:text-white py-1">{{ t().navCatalog }}</a>
          <a (click)="closeMobileMenu()" href="#why-us-section" class="block text-sm font-semibold text-gray-300 hover:text-white py-1">{{ t().navWhy }}</a>
          <a (click)="closeMobileMenu()" href="#how-it-works-section" class="block text-sm font-semibold text-gray-300 hover:text-white py-1">{{ t().navHow }}</a>
          <a (click)="closeMobileMenu()" href="#location-section" class="block text-sm font-semibold text-gray-300 hover:text-white py-1">{{ t().navMap }}</a>
          <a (click)="closeMobileMenu()" href="#faq-section" class="block text-sm font-semibold text-gray-300 hover:text-white py-1">{{ t().navFaq }}</a>
          <div class="pt-2 flex flex-col gap-2 border-t border-white/10">
            <a [href]="'tel:' + PHONE_NUMBER" class="w-full bg-gradient-to-r from-jackets-neon to-red-600 hover:brightness-110 text-white font-extrabold py-2.5 rounded-xl text-center text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer">
              <span class="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <svg class="w-3 h-3 text-red-600 fill-current" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </span>
              <span>{{ t().call }}: {{ PHONE_NUMBER }}</span>
            </a>
          </div>
        </div>
      </header>
      
      <!-- 2. Fascinating High-Impact Cinematic Hero Section -->
      <div id="hero-section" class="relative w-full min-h-[80vh] md:min-h-[88vh] flex items-center justify-center text-center px-4 overflow-hidden border-b border-white/5 bg-black">
        <!-- Prominent Motorcycle Background Image with Cinematic Zoom Entrance -->
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2000')] bg-cover bg-center transition-all duration-1000 ease-out"
             [ngClass]="heroVisible() ? 'scale-100 opacity-75 blur-0' : 'scale-110 opacity-30 blur-[2px]'"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-jackets-matte via-black/35 to-black/55"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-jackets-neon/20 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"
             [ngClass]="heroVisible() ? 'opacity-100 scale-100' : 'opacity-0 scale-75'"></div>

        <div class="relative z-10 max-w-4xl mx-auto py-16 md:py-20 flex flex-col items-center">
          <!-- Minimal Floating Tag -->
          <div class="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-gray-200 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 shadow-xl transition-all duration-700 ease-out"
               [ngClass]="heroVisible() ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'"
               style="transition-delay: 100ms;">
            <span class="w-2 h-2 rounded-full bg-jackets-neon animate-pulse"></span>
            <span>{{ t().tagline }}</span>
          </div>

          <!-- Bold Majestic Headline -->
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-tight text-white drop-shadow-xl transition-all duration-800 ease-out"
              [ngClass]="heroVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
              style="transition-delay: 220ms;">
            {{ t().heroTitle1 }} <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-jackets-neon via-orange-400 to-amber-300 drop-shadow-[0_0_30px_rgba(255,69,0,0.5)]">
              {{ t().heroTitle2 }}
            </span>
          </h1>

          <!-- Minimal Subtitle -->
          <p class="text-sm sm:text-base md:text-lg text-gray-200 max-w-lg mx-auto font-medium leading-relaxed mb-8 drop-shadow transition-all duration-700 ease-out"
             [ngClass]="heroVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
             style="transition-delay: 360ms;">
            {{ t().heroSubtitle }}
          </p>

          <!-- 2 Clean Action CTAs -->
          <div class="flex flex-wrap gap-3.5 justify-center items-center transition-all duration-700 ease-out"
               [ngClass]="heroVisible() ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'"
               style="transition-delay: 480ms;">
            <a href="#showroom-section" class="bg-gradient-to-r from-jackets-neon to-red-600 hover:brightness-110 text-white font-extrabold px-7 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-orange-500/35 transition active:scale-95 cursor-pointer flex items-center gap-2">
              <span>{{ t().exploreBtn }}</span>
              <span>↓</span>
            </a>
            <a [href]="getHeroWhatsAppUrl()" target="_blank" class="bg-[#25D366] hover:bg-[#1ebd5a] text-black font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span>💬</span>
              <span>{{ t().whatsappBtn }}</span>
            </a>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 md:px-6">
        
        <!-- 3. Why Choose Dilz (Minimalist, Low Cognitive Load) -->
        <div id="why-us-section" class="my-16 md:my-24 scroll-mt-24">
          <div class="text-center mb-10 reveal-on-scroll">
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {{ t().whyTitle }}
            </h2>
            <p class="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-1 font-medium">
              {{ t().whySubtitle }}
            </p>
          </div>

          <!-- Desktop Grid (Desktop Only) -->
          <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <!-- Card 1 -->
            <div class="bg-[#161616]/70 p-5 rounded-2xl border border-white/5 hover:border-jackets-neon/40 transition-colors reveal-on-scroll stagger-1">
              <span class="text-2xl block mb-2">🌧️</span>
              <h3 class="text-sm font-bold text-white mb-1">{{ t().whyF1Title }}</h3>
              <p class="text-xs text-gray-400 leading-relaxed font-medium">
                {{ t().whyF1Desc }}
              </p>
            </div>

            <!-- Card 2 -->
            <div class="bg-[#161616]/70 p-5 rounded-2xl border border-white/5 hover:border-jackets-neon/40 transition-colors reveal-on-scroll stagger-2">
              <span class="text-2xl block mb-2">🛡️</span>
              <h3 class="text-sm font-bold text-white mb-1">{{ t().whyF2Title }}</h3>
              <p class="text-xs text-gray-400 leading-relaxed font-medium">
                {{ t().whyF2Desc }}
              </p>
            </div>

            <!-- Card 3 -->
            <div class="bg-[#161616]/70 p-5 rounded-2xl border border-white/5 hover:border-jackets-neon/40 transition-colors reveal-on-scroll stagger-3">
              <span class="text-2xl block mb-2">🏍️</span>
              <h3 class="text-sm font-bold text-white mb-1">{{ t().whyF3Title }}</h3>
              <p class="text-xs text-gray-400 leading-relaxed font-medium">
                {{ t().whyF3Desc }}
              </p>
            </div>

            <!-- Card 4 -->
            <div class="bg-[#161616]/70 p-5 rounded-2xl border border-white/5 hover:border-jackets-neon/40 transition-colors reveal-on-scroll stagger-4">
              <span class="text-2xl block mb-2">📦</span>
              <h3 class="text-sm font-bold text-white mb-1">{{ t().whyF4Title }}</h3>
              <p class="text-xs text-gray-400 leading-relaxed font-medium">
                {{ t().whyF4Desc }}
              </p>
            </div>
          </div>

          <!-- Mobile Auto-Swiping Right-to-Left Carousel (Mobile Only) -->
          <div class="md:hidden relative"
               (touchstart)="onWhyTouchStart($event)"
               (touchend)="onWhyTouchEnd($event)">
            
            <div class="overflow-hidden rounded-2xl border border-jackets-carbon bg-[#161616] shadow-xl">
              <div class="flex transition-transform duration-500 ease-out"
                   [style.transform]="'translateX(-' + (whySlideIndex() * 100) + '%)'">
                
                <!-- Slide 1 -->
                <div class="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-between min-h-[170px]">
                  <div>
                    <span class="text-3xl block mb-2">🌧️</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().whyF1Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().whyF1Desc }}</p>
                  </div>
                  <div class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider mt-3">01 / 04 · Monsoon Proof</div>
                </div>

                <!-- Slide 2 -->
                <div class="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-between min-h-[170px]">
                  <div>
                    <span class="text-3xl block mb-2">🛡️</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().whyF2Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().whyF2Desc }}</p>
                  </div>
                  <div class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider mt-3">02 / 04 · Rider Armor</div>
                </div>

                <!-- Slide 3 -->
                <div class="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-between min-h-[170px]">
                  <div>
                    <span class="text-3xl block mb-2">🏍️</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().whyF3Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().whyF3Desc }}</p>
                  </div>
                  <div class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider mt-3">03 / 04 · Showroom Fit</div>
                </div>

                <!-- Slide 4 -->
                <div class="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-between min-h-[170px]">
                  <div>
                    <span class="text-3xl block mb-2">📦</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().whyF4Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().whyF4Desc }}</p>
                  </div>
                  <div class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider mt-3">04 / 04 · Islandwide COD</div>
                </div>

              </div>
            </div>

            <!-- Dots Indicator for Why Dilz Carousel -->
            <div class="flex items-center justify-center gap-1.5 mt-3.5">
              <button *ngFor="let idx of [0, 1, 2, 3]" 
                      (click)="whySlideIndex.set(idx)"
                      [attr.aria-label]="'Go to slide ' + (idx + 1)"
                      [ngClass]="whySlideIndex() === idx ? 'w-6 bg-jackets-neon shadow-sm shadow-orange-500/50' : 'w-2 bg-white/20'"
                      class="h-2 rounded-full transition-all duration-300 cursor-pointer">
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Engine -->
        <div id="showroom-section" class="flex flex-col md:flex-row justify-between items-center bg-[#1a1a1a] p-4 rounded-xl border border-jackets-carbon shadow-lg gap-4 mb-8 scroll-mt-24 reveal-on-scroll">
          <div class="flex bg-jackets-matte p-1 rounded-lg border border-jackets-carbon w-full md:w-auto">
            <button (click)="setTab('ALL')" [ngClass]="activeTab() === 'ALL' ? 'bg-jackets-neon text-white font-black' : 'text-gray-400 hover:text-white'" class="flex-1 md:px-6 py-2 rounded text-sm transition-all cursor-pointer">{{ t().tabAll }}</button>
            <button (click)="setTab('JACKET')" [ngClass]="activeTab() === 'JACKET' ? 'bg-jackets-neon text-white font-black' : 'text-gray-400 hover:text-white'" class="flex-1 md:px-6 py-2 rounded text-sm transition-all cursor-pointer">{{ t().tabJackets }}</button>
            <button (click)="setTab('RAINCOAT')" [ngClass]="activeTab() === 'RAINCOAT' ? 'bg-jackets-neon text-white font-black' : 'text-gray-400 hover:text-white'" class="flex-1 md:px-6 py-2 rounded text-sm transition-all cursor-pointer">{{ t().tabRaincoats }}</button>
          </div>
          <div class="w-full md:w-64 flex items-center gap-3">
            <label class="text-xs font-bold text-gray-400 uppercase hidden md:block">{{ t().materialLabel }}</label>
            <select [ngModel]="selectedMaterial()" (ngModelChange)="onMaterialChange($event)" class="w-full bg-jackets-matte border border-jackets-carbon rounded p-2.5 text-sm text-white focus:border-jackets-neon outline-none cursor-pointer">
              <option value="ALL">{{ t().allMaterials }}</option>
              <option *ngFor="let mat of dynamicMaterials()" [value]="mat">{{ mat }}</option>
            </select>
          </div>
        </div>

        <!-- Brand-Themed Product Loading Skeleton (8 Cards with Shimmer Effect) -->
        <div *ngIf="isLoading()" class="space-y-6 mb-12">
          <!-- Top loading indicator pill -->
          <div class="flex items-center justify-center">
            <div class="inline-flex items-center gap-2.5 bg-[#181818] border border-jackets-neon/40 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(255,69,0,0.2)]">
              <span class="w-2.5 h-2.5 rounded-full bg-jackets-neon animate-ping"></span>
              <span class="text-xs font-black uppercase tracking-wider text-gray-200">
                {{ currentLang() === 'SI' ? 'යතුරුපැදි ඇඳුම් එකතුව සූදානම් වෙමින් පවතී...' : 'Revving Up Showroom Gear Catalog...' }}
              </span>
            </div>
          </div>

          <!-- 8-Card Skeleton Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let s of [1,2,3,4,5,6,7,8]" class="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-jackets-carbon shadow-xl flex flex-col relative animate-fade-in">
              <!-- Top Category Badge Skeleton -->
              <div class="absolute top-4 left-4 z-20 w-24 h-5 rounded-md skeleton-shimmer"></div>
              
              <!-- Image Skeleton Container -->
              <div class="h-72 sm:h-80 md:h-[300px] skeleton-shimmer relative flex items-center justify-center border-b border-white/5">
                <svg class="w-14 h-14 text-white/5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h4.2c.45 2.31 2.44 4 4.9 4 2.8 0 5-2.2 5-5 0-2.61-1.95-4.74-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.66 0-3-1.34-3-3s1.34-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zm11.18 2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
              </div>

              <!-- Card Content Body Skeleton -->
              <div class="p-5 flex-grow flex flex-col justify-between space-y-3.5">
                <div>
                  <div class="h-5 w-3/4 rounded-lg skeleton-shimmer mb-2.5"></div>
                  <div class="h-4 w-24 rounded-md skeleton-shimmer mb-3"></div>

                  <div class="flex items-center justify-between pb-3 mb-3 border-b border-jackets-carbon">
                    <div class="space-y-1">
                      <div class="h-2 w-8 rounded skeleton-shimmer"></div>
                      <div class="h-5 w-20 rounded-lg skeleton-shimmer"></div>
                    </div>
                    <div class="h-5 w-16 rounded-full skeleton-shimmer"></div>
                  </div>

                  <div class="space-y-2 mb-3">
                    <div class="h-2.5 w-16 rounded skeleton-shimmer"></div>
                    <div class="flex gap-1.5">
                      <div class="h-9 w-10 rounded-lg skeleton-shimmer"></div>
                      <div class="h-9 w-10 rounded-lg skeleton-shimmer"></div>
                      <div class="h-9 w-10 rounded-lg skeleton-shimmer"></div>
                      <div class="h-9 w-10 rounded-lg skeleton-shimmer"></div>
                    </div>
                  </div>
                </div>

                <div class="space-y-2 pt-1">
                  <div class="flex gap-2">
                    <div class="h-10 flex-1 rounded-xl skeleton-shimmer"></div>
                    <div class="h-10 flex-1 rounded-xl skeleton-shimmer"></div>
                  </div>
                  <div class="h-7 w-full rounded-xl skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. The Showroom Grid with Superior Size UX & 6-Product Pagination -->
        <!-- Desktop Grid (Hidden on Mobile) -->
        <div *ngIf="!isLoading()" class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div *ngFor="let p of paginatedProducts(); let idx = index" 
               [ngClass]="'stagger-' + ((idx % 3) + 1)"
               class="product-card-container reveal-on-scroll bg-[#1a1a1a] rounded-2xl overflow-hidden border border-jackets-carbon hover:border-jackets-neon/40 shadow-xl transition-all duration-300 flex flex-col relative group">
            
            <!-- Category Tag -->
            <div class="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md border border-gray-600 text-gray-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-lg">
              {{ t().unisexTag }}
            </div>

            <!-- Active Selected Size Floating Indicator on Image with 1-Click Deselect -->
            <button *ngIf="selectedSizes()[p.id!]" 
                    type="button"
                    (click)="clearSize(p.id!); $event.stopPropagation()"
                    [title]="t().clearSize"
                    class="size-badge-btn absolute top-4 right-4 z-20 bg-jackets-neon hover:bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,69,0,0.7)] flex items-center gap-1.5 border border-white/40 cursor-pointer transition active:scale-95 group/badge">
              <span>✓</span> SIZE {{ selectedSizes()[p.id!] }}
              <span class="text-[10px] opacity-75 group-hover/badge:opacity-100">✕</span>
            </button>

            <!-- Enlarged Product Image Container (Full Image Visibility) -->
            <div class="h-80 sm:h-96 md:h-[380px] overflow-hidden relative bg-[#151515] flex items-center justify-center">
              <img [src]="p.imageUrls[0]" class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" [alt]="p.name" />
              <div *ngIf="!p.inStock" class="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
                <span class="bg-red-600 text-white font-black px-5 py-2.5 rounded-lg transform -rotate-12 text-xl border-2 border-red-400 shadow-2xl tracking-wider">{{ t().soldOut }}</span>
              </div>
            </div>

            <!-- Card Content Body -->
            <div class="p-6 flex-grow flex flex-col justify-between">
              <div>
                <!-- Title & Material -->
                <h2 class="text-xl font-black uppercase tracking-wide leading-tight mb-2 text-white group-hover:text-jackets-neon transition-colors">
                  {{ p.name }}
                </h2>
                <div class="mb-4">
                  <span class="inline-block bg-jackets-carbon text-gray-300 text-xs font-bold px-2.5 py-1 rounded-md border border-[#383838]">
                    🛡️ {{ p.material }}
                  </span>
                </div>

                <!-- Price & Stock Row -->
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-jackets-carbon">
                  <div>
                    <span class="text-[10px] text-gray-400 uppercase font-black tracking-wider block">{{ t().priceLabel }}</span>
                    <span class="text-2xl font-mono font-black text-jackets-yellow tracking-tight">Rs. {{ p.priceLkr | number:'1.0-0' }}</span>
                  </div>
                  <span [ngClass]="p.inStock ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' : 'text-red-400 bg-red-950/60 border-red-500/40'" class="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" [ngClass]="p.inStock ? 'bg-emerald-400 animate-ping' : 'bg-red-400'"></span>
                    {{ p.inStock ? t().inStock : t().soldOut }}
                  </span>
                </div>
                
                <!-- Minimal Size Selector with Container Class for Outside Click Detection -->
                <div class="size-selector-container mb-5">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ t().selectSizeNotice }}</span>
                    <button *ngIf="selectedSizes()[p.id!]" 
                            type="button" 
                            (click)="clearSize(p.id!); $event.stopPropagation()" 
                            class="text-[11px] text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-1">
                      <span>✕</span> {{ t().clearSize }} ({{ selectedSizes()[p.id!] }})
                    </button>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button *ngFor="let s of p.availableSizes" 
                            type="button"
                            (click)="selectOrToggleSize(p.id!, s)"
                            [disabled]="!p.inStock"
                            [title]="selectedSizes()[p.id!] === s ? t().clearSize : s"
                            [ngClass]="selectedSizes()[p.id!] === s ? 
                              'bg-jackets-neon text-white font-black border-jackets-neon shadow-md shadow-orange-500/30 scale-105' : 
                              'bg-[#222] border-neutral-700/80 text-gray-300 hover:bg-[#2a2a2a] hover:text-white font-bold'"
                            class="h-10 min-w-[46px] px-3 flex items-center justify-center rounded-lg border text-xs transition active:scale-95 cursor-pointer">
                      {{ s }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Reservation Action Bar -->
              <div class="reservation-actions mt-auto">
                <div class="flex gap-2">
                  <!-- WhatsApp Direct -->
                  <button [disabled]="!p.inStock || !selectedSizes()[p.id!]" 
                          (click)="reserveViaWhatsApp(p)"
                          [title]="!selectedSizes()[p.id!] ? t().step1Notice : t().reserveWhatsapp"
                          class="flex-1 bg-[#25D366] hover:bg-[#1ebd5a] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-extrabold py-3 rounded-xl transition flex justify-center items-center gap-2 text-xs md:text-sm cursor-pointer shadow-md">
                    <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    {{ t().reserveWhatsapp }}
                  </button>
                  <!-- Email Form Modal Trigger -->
                  <button [disabled]="!p.inStock || !selectedSizes()[p.id!]" 
                          (click)="openEmailModal(p)"
                          [title]="!selectedSizes()[p.id!] ? t().step1Notice : t().reserveEmail"
                          class="flex-1 bg-jackets-carbon hover:bg-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:border-transparent disabled:cursor-not-allowed border border-neutral-700 text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs md:text-sm cursor-pointer">
                    <span>✉️</span> {{ t().reserveEmail }}
                  </button>
                </div>

                <!-- Animated Step 1 Attention Callout Below the Buttons -->
                <div class="mt-2.5">
                  <div *ngIf="!selectedSizes()[p.id!]" 
                       class="py-2 px-3 rounded-xl bg-jackets-neon/15 border border-jackets-neon/50 shadow-[0_0_15px_rgba(255,69,0,0.3)] flex items-center justify-between text-xs animate-pulse">
                    <span class="text-white font-extrabold flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <span class="text-sm animate-bounce inline-block">👉</span> {{ t().step1Notice }}
                    </span>
                    <span class="bg-jackets-neon text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow">
                      {{ t().step1Badge }}
                    </span>
                  </div>
                  <div *ngIf="selectedSizes()[p.id!]" 
                       class="py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <span class="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <span>✓</span> {{ p.name }} ({{ selectedSizes()[p.id!] }}) {{ t().readyToHold }}
                    </span>
                    <button type="button" 
                            (click)="clearSize(p.id!); $event.stopPropagation()"
                            class="size-badge-btn text-[10px] text-gray-400 hover:text-white underline cursor-pointer">
                      {{ t().resetBtn }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile 1*1 Product Slider (Manually Sliding Left-to-Right / Right-to-Left, 1 Product at a Time) -->
        <div *ngIf="!isLoading() && paginatedProducts().length > 0" 
             class="md:hidden relative mb-8"
             (touchstart)="onProductTouchStart($event)"
             (touchend)="onProductTouchEnd($event)">
          
          <!-- Slider Navigation Header Bar -->
          <div class="flex items-center justify-between bg-[#141414] px-4 py-2.5 rounded-xl border border-white/5 mb-3 shadow-md">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {{ t().paginationProducts }} <span class="text-white font-mono">{{ mobileProductIndex() + 1 }}</span> / <span class="text-gray-300 font-mono">{{ paginatedProducts().length }}</span>
            </span>
            <div class="flex items-center gap-2">
              <button type="button"
                      (click)="prevMobileProduct()"
                      [attr.aria-label]="'Previous product'"
                      class="w-8 h-8 rounded-lg bg-neutral-800 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm border border-neutral-700 active:scale-95 transition cursor-pointer">
                ‹
              </button>
              <button type="button"
                      (click)="nextMobileProduct()"
                      [attr.aria-label]="'Next product'"
                      class="w-8 h-8 rounded-lg bg-jackets-neon text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/30 active:scale-95 transition cursor-pointer">
                ›
              </button>
            </div>
          </div>

          <!-- 1*1 Sliding Track (1 product at a time) -->
          <div class="overflow-hidden rounded-2xl border border-jackets-carbon shadow-2xl">
            <div class="flex transition-transform duration-300 ease-out"
                 [style.transform]="'translateX(-' + (mobileProductIndex() * 100) + '%)'">
              
              <div *ngFor="let p of paginatedProducts(); let idx = index" 
                   class="w-full min-w-full flex-shrink-0 bg-[#1a1a1a] flex flex-col relative group">
                
                <!-- Category Tag -->
                <div class="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md border border-gray-600 text-gray-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-lg">
                  {{ t().unisexTag }}
                </div>

                <!-- Active Selected Size Floating Indicator on Image with 1-Click Deselect -->
                <button *ngIf="selectedSizes()[p.id!]" 
                        type="button"
                        (click)="clearSize(p.id!); $event.stopPropagation()"
                        [title]="t().clearSize"
                        class="size-badge-btn absolute top-4 right-4 z-20 bg-jackets-neon hover:bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,69,0,0.7)] flex items-center gap-1.5 border border-white/40 cursor-pointer transition active:scale-95 group/badge">
                  <span>✓</span> SIZE {{ selectedSizes()[p.id!] }}
                  <span class="text-[10px] opacity-75 group-hover/badge:opacity-100">✕</span>
                </button>

                <!-- Enlarged Product Image Container -->
                <div class="h-80 sm:h-96 overflow-hidden relative bg-[#151515] flex items-center justify-center">
                  <img [src]="p.imageUrls[0]" class="w-full h-full object-cover object-top transition-transform duration-700" [alt]="p.name" />
                  <div *ngIf="!p.inStock" class="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
                    <span class="bg-red-600 text-white font-black px-5 py-2.5 rounded-lg transform -rotate-12 text-xl border-2 border-red-400 shadow-2xl tracking-wider">{{ t().soldOut }}</span>
                  </div>
                </div>

                <!-- Card Content Body -->
                <div class="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <!-- Title & Material -->
                    <h2 class="text-xl font-black uppercase tracking-wide leading-tight mb-2 text-white">
                      {{ p.name }}
                    </h2>
                    <div class="mb-4">
                      <span class="inline-block bg-jackets-carbon text-gray-300 text-xs font-bold px-2.5 py-1 rounded-md border border-[#383838]">
                        🛡️ {{ p.material }}
                      </span>
                    </div>

                    <!-- Price & Stock Row -->
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-jackets-carbon">
                      <div>
                        <span class="text-[10px] text-gray-400 uppercase font-black tracking-wider block">{{ t().priceLabel }}</span>
                        <span class="text-2xl font-mono font-black text-jackets-yellow tracking-tight">Rs. {{ p.priceLkr | number:'1.0-0' }}</span>
                      </div>
                      <span [ngClass]="p.inStock ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' : 'text-red-400 bg-red-950/60 border-red-500/40'" class="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full" [ngClass]="p.inStock ? 'bg-emerald-400 animate-ping' : 'bg-red-400'"></span>
                        {{ p.inStock ? t().inStock : t().soldOut }}
                      </span>
                    </div>
                    
                    <!-- Minimal Size Selector with Container Class for Outside Click Detection -->
                    <div class="size-selector-container mb-5">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ t().selectSizeNotice }}</span>
                        <button *ngIf="selectedSizes()[p.id!]" 
                                type="button" 
                                (click)="clearSize(p.id!); $event.stopPropagation()" 
                                class="text-[11px] text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-1">
                          <span>✕</span> {{ t().clearSize }} ({{ selectedSizes()[p.id!] }})
                        </button>
                      </div>

                      <div class="flex flex-wrap gap-2">
                        <button *ngFor="let s of p.availableSizes" 
                                type="button"
                                (click)="selectOrToggleSize(p.id!, s)"
                                [disabled]="!p.inStock"
                                [title]="selectedSizes()[p.id!] === s ? t().clearSize : s"
                                [ngClass]="selectedSizes()[p.id!] === s ? 
                                  'bg-jackets-neon text-white font-black border-jackets-neon shadow-md shadow-orange-500/30 scale-105' : 
                                  'bg-[#222] border-neutral-700/80 text-gray-300 hover:bg-[#2a2a2a] hover:text-white font-bold'"
                                class="h-10 min-w-[46px] px-3 flex items-center justify-center rounded-lg border text-xs transition active:scale-95 cursor-pointer">
                          {{ s }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Reservation Action Bar -->
                  <div class="reservation-actions mt-auto">
                    <div class="flex gap-2">
                      <!-- WhatsApp Direct -->
                      <button [disabled]="!p.inStock || !selectedSizes()[p.id!]" 
                              (click)="reserveViaWhatsApp(p)"
                              [title]="!selectedSizes()[p.id!] ? t().step1Notice : t().reserveWhatsapp"
                              class="flex-1 bg-[#25D366] hover:bg-[#1ebd5a] disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-extrabold py-3 rounded-xl transition flex justify-center items-center gap-2 text-xs cursor-pointer shadow-md">
                        <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        {{ t().reserveWhatsapp }}
                      </button>
                      <!-- Email Form Modal Trigger -->
                      <button [disabled]="!p.inStock || !selectedSizes()[p.id!]" 
                              (click)="openEmailModal(p)"
                              [title]="!selectedSizes()[p.id!] ? t().step1Notice : t().reserveEmail"
                              class="flex-1 bg-jackets-carbon hover:bg-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:border-transparent disabled:cursor-not-allowed border border-neutral-700 text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer">
                        <span>✉️</span> {{ t().reserveEmail }}
                      </button>
                    </div>

                    <!-- Animated Step 1 Attention Callout -->
                    <div class="mt-2.5">
                      <div *ngIf="!selectedSizes()[p.id!]" 
                           class="py-2 px-3 rounded-xl bg-jackets-neon/15 border border-jackets-neon/50 shadow-[0_0_15px_rgba(255,69,0,0.3)] flex items-center justify-between text-xs animate-pulse">
                        <span class="text-white font-extrabold flex items-center gap-1.5 text-[11px]">
                          <span class="text-sm animate-bounce inline-block">👉</span> {{ t().step1Notice }}
                        </span>
                        <span class="bg-jackets-neon text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow">
                          {{ t().step1Badge }}
                        </span>
                      </div>
                      <div *ngIf="selectedSizes()[p.id!]" 
                           class="py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <span class="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                          <span>✓</span> {{ p.name }} ({{ selectedSizes()[p.id!] }}) {{ t().readyToHold }}
                        </span>
                        <button type="button" 
                                (click)="clearSize(p.id!); $event.stopPropagation()"
                                class="size-badge-btn text-[10px] text-gray-400 hover:text-white underline cursor-pointer">
                          {{ t().resetBtn }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Dots Indicator for Products in Current Page -->
          <div class="flex items-center justify-center gap-1.5 mt-3">
            <button *ngFor="let p of paginatedProducts(); let i = index"
                    (click)="mobileProductIndex.set(i)"
                    [attr.aria-label]="'Go to product ' + (i + 1)"
                    [ngClass]="mobileProductIndex() === i ? 'w-6 bg-jackets-neon shadow-sm shadow-orange-500/50' : 'w-2 bg-white/20'"
                    class="h-2 rounded-full transition-all duration-300 cursor-pointer">
            </button>
          </div>
        </div>

        <!-- 6-Product Pagination Controls (Desktop Only - Mobile browses 1-to-1 via showroom slider) -->
        <div *ngIf="!isLoading() && filteredProducts().length > 0" class="flex items-center justify-center md:justify-between bg-[#141414] p-3.5 rounded-xl border border-white/5 mb-16 shadow-lg reveal-on-scroll">
          <div class="text-xs text-gray-400 font-semibold text-center md:text-left">
            <span class="text-white font-bold">{{ filteredProducts().length }}</span> {{ t().paginationProducts }}
          </div>

          <!-- Page Navigation (Hidden on mobile because mobile uses the 1-to-1 card slider) -->
          <div class="hidden md:flex items-center gap-1.5">
            <!-- Prev Button -->
            <button (click)="goToPage(currentPage() - 1)" 
                    [disabled]="currentPage() <= 1"
                    aria-label="Previous page"
                    class="w-8 h-8 rounded-lg border border-neutral-800 bg-[#1e1e1e] text-xs font-bold disabled:opacity-25 disabled:cursor-not-allowed hover:border-jackets-neon hover:text-white transition flex items-center justify-center cursor-pointer">
              ‹
            </button>

            <!-- Page Number Buttons -->
            <button *ngFor="let page of totalPagesArray()" 
                    (click)="goToPage(page)"
                    [disabled]="totalPages() <= 1"
                    [ngClass]="currentPage() === page ? 'bg-jackets-neon text-white font-black border-jackets-neon' : 'bg-[#1e1e1e] text-gray-400 border-neutral-800 hover:text-white font-semibold'"
                    class="w-8 h-8 rounded-lg border text-xs transition flex items-center justify-center cursor-pointer disabled:cursor-default">
              {{ page }}
            </button>

            <!-- Next Button -->
            <button (click)="goToPage(currentPage() + 1)" 
                    [disabled]="currentPage() >= totalPages()"
                    aria-label="Next page"
                    class="w-8 h-8 rounded-lg border border-neutral-800 bg-[#1e1e1e] text-xs font-bold disabled:opacity-25 disabled:cursor-not-allowed hover:border-jackets-neon hover:text-white transition flex items-center justify-center cursor-pointer">
              ›
            </button>
          </div>
        </div>

        <!-- 4. How Reservation Works (Minimalist 3 Steps - Grid on Desktop, Manually Swipeable on Mobile) -->
        <div id="how-it-works-section" class="my-20 md:my-28 scroll-mt-24">
          <div class="text-center mb-10 reveal-on-scroll">
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {{ t().howTitle }}
            </h2>
            <p class="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-1 font-medium">
              {{ t().howSubtitle }}
            </p>
          </div>

          <!-- Desktop Grid (Desktop Only) -->
          <div class="hidden md:grid md:grid-cols-3 gap-5">
            <!-- Step 1 -->
            <div class="bg-[#161616]/70 border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between hover:border-white/20 transition-colors reveal-on-scroll stagger-1">
              <span class="text-3xl font-black text-white/10 absolute top-5 right-5">01</span>
              <div>
                <span class="text-2xl block mb-3">🔍</span>
                <h3 class="text-base font-bold text-white mb-1.5">{{ t().howStep1Title }}</h3>
                <p class="text-xs text-gray-400 leading-relaxed font-medium">
                  {{ t().howStep1Desc }}
                </p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="bg-[#161616]/70 border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between hover:border-white/20 transition-colors reveal-on-scroll stagger-2">
              <span class="text-3xl font-black text-white/10 absolute top-5 right-5">02</span>
              <div>
                <span class="text-2xl block mb-3">💬</span>
                <h3 class="text-base font-bold text-white mb-1.5">{{ t().howStep2Title }}</h3>
                <p class="text-xs text-gray-400 leading-relaxed font-medium">
                  {{ t().howStep2Desc }}
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="bg-[#161616]/70 border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between hover:border-white/20 transition-colors reveal-on-scroll stagger-3">
              <span class="text-3xl font-black text-white/10 absolute top-5 right-5">03</span>
              <div>
                <span class="text-2xl block mb-3">🏍️</span>
                <h3 class="text-base font-bold text-white mb-1.5">{{ t().howStep3Title }}</h3>
                <p class="text-xs text-gray-400 leading-relaxed font-medium">
                  {{ t().howStep3Desc }}
                </p>
              </div>
            </div>
          </div>

          <!-- Mobile Manually Swipeable Carousel (Mobile Only) -->
          <div class="md:hidden relative"
               (touchstart)="onHowTouchStart($event)"
               (touchend)="onHowTouchEnd($event)">
            
            <div class="overflow-hidden rounded-2xl border border-jackets-carbon bg-[#161616] shadow-xl">
              <div class="flex transition-transform duration-300 ease-out"
                   [style.transform]="'translateX(-' + (howSlideIndex() * 100) + '%)'">
                
                <!-- Step 1 Slide -->
                <div class="w-full min-w-full flex-shrink-0 p-6 relative flex flex-col justify-between min-h-[190px]">
                  <span class="text-4xl font-black text-white/10 absolute top-5 right-5">01</span>
                  <div>
                    <span class="text-3xl block mb-3">🔍</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().howStep1Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().howStep1Desc }}</p>
                  </div>
                  <div class="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                    <span class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider">Step 01 / 03</span>
                    <div class="flex gap-1.5">
                      <button type="button" (click)="prevHowSlide()" aria-label="Previous step" class="w-7 h-7 rounded-lg bg-neutral-800 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs border border-neutral-700 active:scale-95 cursor-pointer">‹</button>
                      <button type="button" (click)="nextHowSlide()" aria-label="Next step" class="w-7 h-7 rounded-lg bg-jackets-neon text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30 active:scale-95 cursor-pointer">›</button>
                    </div>
                  </div>
                </div>

                <!-- Step 2 Slide -->
                <div class="w-full min-w-full flex-shrink-0 p-6 relative flex flex-col justify-between min-h-[190px]">
                  <span class="text-4xl font-black text-white/10 absolute top-5 right-5">02</span>
                  <div>
                    <span class="text-3xl block mb-3">💬</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().howStep2Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().howStep2Desc }}</p>
                  </div>
                  <div class="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                    <span class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider">Step 02 / 03</span>
                    <div class="flex gap-1.5">
                      <button type="button" (click)="prevHowSlide()" aria-label="Previous step" class="w-7 h-7 rounded-lg bg-neutral-800 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs border border-neutral-700 active:scale-95 cursor-pointer">‹</button>
                      <button type="button" (click)="nextHowSlide()" aria-label="Next step" class="w-7 h-7 rounded-lg bg-jackets-neon text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30 active:scale-95 cursor-pointer">›</button>
                    </div>
                  </div>
                </div>

                <!-- Step 3 Slide -->
                <div class="w-full min-w-full flex-shrink-0 p-6 relative flex flex-col justify-between min-h-[190px]">
                  <span class="text-4xl font-black text-white/10 absolute top-5 right-5">03</span>
                  <div>
                    <span class="text-3xl block mb-3">🏍️</span>
                    <h3 class="text-base font-bold text-white mb-1.5">{{ t().howStep3Title }}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed font-medium">{{ t().howStep3Desc }}</p>
                  </div>
                  <div class="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                    <span class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider">Step 03 / 03</span>
                    <div class="flex gap-1.5">
                      <button type="button" (click)="prevHowSlide()" aria-label="Previous step" class="w-7 h-7 rounded-lg bg-neutral-800 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs border border-neutral-700 active:scale-95 cursor-pointer">‹</button>
                      <button type="button" (click)="nextHowSlide()" aria-label="Next step" class="w-7 h-7 rounded-lg bg-jackets-neon text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30 active:scale-95 cursor-pointer">›</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Dots Indicator for How It Works -->
            <div class="flex items-center justify-center gap-1.5 mt-3.5">
              <button *ngFor="let idx of [0, 1, 2]"
                      (click)="howSlideIndex.set(idx)"
                      [attr.aria-label]="'Go to step ' + (idx + 1)"
                      [ngClass]="howSlideIndex() === idx ? 'w-6 bg-jackets-neon shadow-sm shadow-orange-500/50' : 'w-2 bg-white/20'"
                      class="h-2 rounded-full transition-all duration-300 cursor-pointer">
              </button>
            </div>
          </div>
        </div>

        <!-- 5. Showroom & Location (Clean, Unified Layout) -->
        <div id="location-section" class="my-20 md:my-28 scroll-mt-24">
          <div class="text-center mb-10 reveal-on-scroll">
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {{ t().showroomTitle }}
            </h2>
            <p class="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-1 font-medium">
              {{ t().showroomSubtitle }}
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <!-- Left Info & Actions Card -->
            <div class="lg:col-span-5 bg-[#161616]/90 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl reveal-on-scroll stagger-1">
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-jackets-neon mb-2">{{ t().showroomTag }}</div>
                <h3 class="text-xl md:text-2xl font-black text-white mb-4">{{ t().showroomTitle }}</h3>
                <p class="text-xs md:text-sm text-gray-400 font-medium leading-relaxed mb-6">
                  {{ t().showroomDesc }}
                </p>

                <div class="space-y-4 text-xs md:text-sm">
                  <div class="flex items-start gap-3">
                    <span class="text-base text-gray-400 shrink-0">📍</span>
                    <div>
                      <span class="font-bold text-white block">{{ t().locLabel }}</span>
                      <span class="text-gray-400 text-xs">{{ t().locValue }}</span>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <span class="text-base text-gray-400 shrink-0">⏰</span>
                    <div>
                      <span class="font-bold text-white block">{{ t().hoursLabel }}</span>
                      <span class="text-gray-400 text-xs">{{ t().hoursValue }}</span>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <span class="text-base text-gray-400 shrink-0">📞</span>
                    <div>
                      <span class="font-bold text-white block">{{ t().phoneLabel }}</span>
                      <a [href]="'tel:' + PHONE_NUMBER" class="text-jackets-neon font-mono font-bold text-xs hover:underline">
                        {{ PHONE_NUMBER }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-white/5">
                <a href="https://www.google.com/maps/search/?api=1&query=Rathkarawwa,+Maspotha,+Kurunegala" 
                   target="_blank" 
                   class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer">
                  {{ t().directionsBtn }}
                </a>
                <a [href]="getMapWhatsAppUrl()" 
                   target="_blank" 
                   class="flex-1 bg-[#25D366] hover:bg-[#1ebd5a] text-black font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer">
                  {{ t().showroomWhatsappBtn }}
                </a>
              </div>
            </div>

            <!-- Right Map Embed -->
            <div class="lg:col-span-7 bg-[#161616]/90 border border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[340px] flex reveal-on-scroll stagger-2">
              <iframe 
                src="https://maps.google.com/maps?q=Rathkarawwa,+Maspotha,+Kurunegala,+Sri+Lanka&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                class="w-full h-full min-h-[340px] border-0" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </div>

        <!-- 6. Rider Feedback (Punchy, Clean Social Proof) -->
        <div id="reviews-section" class="my-20 md:my-28 scroll-mt-24">
          <div class="text-center mb-10 reveal-on-scroll">
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {{ t().reviewsTitle }}
            </h2>
            <p class="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-1 font-medium">
              {{ t().reviewsSubtitle }}
            </p>
          </div>

          <!-- Desktop Grid (Desktop Only) -->
          <div class="hidden md:grid md:grid-cols-3 gap-5 reveal-on-scroll">
            <div *ngFor="let r of reviewsList(); let i = index; trackBy: trackByIndex" 
                 [ngClass]="'stagger-' + (i + 1)"
                 class="bg-[#161616]/70 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-lg">
              <div>
                <div class="text-amber-400 text-xs tracking-widest mb-3">★★★★★</div>
                <p class="text-gray-300 text-xs md:text-sm leading-relaxed italic mb-4 font-medium">
                  "{{ r.text }}"
                </p>
              </div>
              <div class="pt-3 border-t border-white/5 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-jackets-neon font-bold text-xs flex items-center justify-center">
                  {{ r.name.charAt(0) }}
                </div>
                <div>
                  <h4 class="font-bold text-white text-xs">{{ r.name }}</h4>
                  <p class="text-[11px] text-gray-500 font-medium">{{ r.role }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Auto-Swiping Right-to-Left Rider Feedback (Mobile Only) -->
          <div class="md:hidden relative"
               (touchstart)="onReviewTouchStart($event)"
               (touchend)="onReviewTouchEnd($event)">
            
            <div class="overflow-hidden rounded-2xl border border-jackets-carbon bg-[#161616] shadow-xl">
              <div class="flex transition-transform duration-500 ease-out"
                   [style.transform]="'translateX(-' + (reviewSlideIndex() * 100) + '%)'">
                
                <div *ngFor="let r of reviewsList(); let i = index" 
                     class="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <div class="text-amber-400 text-sm tracking-widest mb-3">★★★★★</div>
                    <p class="text-gray-200 text-sm leading-relaxed italic mb-4 font-medium">
                      "{{ r.text }}"
                    </p>
                  </div>
                  <div class="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-9 h-9 rounded-full bg-jackets-neon/20 border border-jackets-neon text-jackets-neon font-bold text-sm flex items-center justify-center">
                        {{ r.name.charAt(0) }}
                      </div>
                      <div>
                        <h4 class="font-bold text-white text-xs">{{ r.name }}</h4>
                        <p class="text-[11px] text-gray-400 font-medium">{{ r.role }}</p>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold text-jackets-neon uppercase tracking-wider">0{{ i + 1 }} / 0{{ reviewsList().length }}</span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Dots Indicator for Rider Feedback Carousel -->
            <div class="flex items-center justify-center gap-1.5 mt-3.5">
              <button *ngFor="let r of reviewsList(); let i = index"
                      (click)="reviewSlideIndex.set(i)"
                      [attr.aria-label]="'Go to review ' + (i + 1)"
                      [ngClass]="reviewSlideIndex() === i ? 'w-6 bg-jackets-neon shadow-sm shadow-orange-500/50' : 'w-2 bg-white/20'"
                      class="h-2 rounded-full transition-all duration-300 cursor-pointer">
              </button>
            </div>
          </div>
        </div>

        <!-- 7. Frequently Asked Questions (Minimalist Accordion in Desktop, Manually Swiped in Mobile) -->
        <div id="faq-section" class="my-20 md:my-28 scroll-mt-24">
          <div class="text-center mb-10 reveal-on-scroll">
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {{ t().faqTitle }}
            </h2>
            <p class="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-1 font-medium">
              {{ t().faqSubtitle }}
            </p>
          </div>

          <!-- Desktop Accordion (Desktop Only) -->
          <div class="hidden md:block max-w-2xl mx-auto space-y-2.5 reveal-on-scroll">
            <div *ngFor="let item of currentFaqList(); let i = index" class="border border-white/5 rounded-xl overflow-hidden bg-[#161616]/70">
              <button (click)="toggleFaq(i)" class="w-full p-4 text-left flex justify-between items-center font-bold text-white hover:text-jackets-neon transition cursor-pointer gap-4">
                <span class="text-xs md:text-sm font-semibold">{{ item.question }}</span>
                <span class="text-gray-400 font-mono text-sm shrink-0 w-5 text-center">{{ openFaqIndex() === i ? '−' : '+' }}</span>
              </button>
              <div *ngIf="openFaqIndex() === i" class="px-4 pb-4 text-xs text-gray-400 leading-relaxed font-medium">
                {{ item.answer }}
              </div>
            </div>
          </div>

          <!-- Mobile Manually Swiped FAQ (Mobile Only - Manual Swipe with Prev/Next buttons & Dots) -->
          <div class="md:hidden relative"
               (touchstart)="onFaqTouchStart($event)"
               (touchend)="onFaqTouchEnd($event)">
            
            <div class="overflow-hidden rounded-2xl border border-jackets-carbon bg-[#161616] shadow-xl">
              <div class="flex transition-transform duration-300 ease-out"
                   [style.transform]="'translateX(-' + (faqSlideIndex() * 100) + '%)'">
                
                <div *ngFor="let item of currentFaqList(); let i = index" 
                     class="w-full min-w-full flex-shrink-0 p-6 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div class="inline-flex items-center gap-1.5 bg-jackets-neon/15 border border-jackets-neon/40 text-jackets-neon text-[10px] font-black uppercase px-2.5 py-1 rounded-full mb-3">
                      <span>FAQ</span> · 0{{ i + 1 }} / 0{{ currentFaqList().length }}
                    </div>
                    <h3 class="text-sm font-bold text-white mb-2.5 leading-snug">
                      {{ item.question }}
                    </h3>
                    <p class="text-xs text-gray-300 leading-relaxed font-medium">
                      {{ item.answer }}
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                    <span class="text-[10px] text-gray-500 font-mono">Swipe ‹ / › to navigate</span>
                    <div class="flex gap-1.5">
                      <button type="button" (click)="prevFaqSlide()" aria-label="Previous question" class="w-7 h-7 rounded-lg bg-neutral-800 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs border border-neutral-700 active:scale-95 cursor-pointer">‹</button>
                      <button type="button" (click)="nextFaqSlide()" aria-label="Next question" class="w-7 h-7 rounded-lg bg-jackets-neon text-white flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30 active:scale-95 cursor-pointer">›</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Dots Indicator for FAQ Carousel -->
            <div class="flex items-center justify-center gap-1.5 mt-3.5">
              <button *ngFor="let item of currentFaqList(); let i = index"
                      (click)="faqSlideIndex.set(i)"
                      [attr.aria-label]="'Go to FAQ slide ' + (i + 1)"
                      [ngClass]="faqSlideIndex() === i ? 'w-6 bg-jackets-neon shadow-sm shadow-orange-500/50' : 'w-2 bg-white/20'"
                      class="h-2 rounded-full transition-all duration-300 cursor-pointer">
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- 8. Ultra-Minimalist Footer (Full Width, Generous Mobile Bottom Padding) -->
      <footer class="w-full bg-[#0f0f0f] border-t border-white/5 py-8 pb-36 md:pb-8 text-gray-400 reveal-on-scroll">
        <div class="max-w-6xl mx-auto px-4 md:px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5 text-xs">
            <!-- Left: Brand & Location (Enlarged Logo + Intact CSS Styled Name Logo) -->
            <div class="flex items-center gap-3">
              <img src="assets/DilzJackets_Logo_web.png" alt="Dilz Jackets" class="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow" />
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-center sm:text-left">
                <span class="text-white font-black uppercase tracking-tight text-sm">DILZ <span class="text-jackets-neon">JACKETS</span></span>
                <span class="hidden sm:inline text-gray-500">·</span>
                <span class="text-gray-400 text-[11px] font-medium">{{ t().footerLocation }}</span>
              </div>
            </div>

            <!-- Center: Simple links -->
            <nav class="flex items-center gap-6 text-gray-300 text-xs font-semibold tracking-wider">
              <a href="#showroom-section" class="hover:text-white transition">{{ t().footerCatalog }}</a>
              <a href="#location-section" class="hover:text-white transition">{{ t().footerMap }}</a>
              <a href="#faq-section" class="hover:text-white transition">{{ t().footerFaq }}</a>
            </nav>

            <!-- Right: Direct Phone Call & WhatsApp Links -->
            <div class="flex flex-wrap items-center justify-center gap-2.5">
              <a [href]="'tel:' + PHONE_NUMBER" class="hover:text-white font-mono transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] cursor-pointer">
                <span>📞</span> {{ PHONE_NUMBER }}
              </a>
              <a [href]="getHeroWhatsAppUrl()" target="_blank" class="text-[#25D366] hover:text-[#1ebd5a] font-mono font-bold transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[11px] cursor-pointer">
                <span>💬</span> WhatsApp
              </a>
            </div>
          </div>

          <!-- Bottom Sub-bar: Copyright & Admin Portal -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-[11px] text-gray-500">
            <span>© 2026 DilzJackets. All rights reserved.</span>
            <button (click)="navigateToAdmin()" type="button" class="hover:text-gray-300 transition cursor-pointer bg-transparent border-0 text-inherit p-0 font-inherit flex items-center gap-1">
              🔒 {{ t().footerStaff }}
            </button>
          </div>
        </div>
      </footer>

      <!-- 5. EmailJS Reservation Modal -->
      <div *ngIf="showEmailModal()" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="email-modal-container bg-[#1a1a1a] border border-jackets-carbon rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
          <button (click)="showEmailModal.set(false)" class="absolute top-4 right-4 text-gray-400 hover:text-white font-black text-xl cursor-pointer">&times;</button>
          
          <h2 class="text-xl font-black text-white mb-2 uppercase">{{ t().modalTitle }}</h2>
          <p class="text-sm text-gray-400 mb-6 font-semibold">
            <span *ngIf="currentLang() === 'SI'">
              අපගේ රත්කරව්ව ප්‍රදර්ශනාගාරයේදී <span class="text-jackets-yellow">{{ selectedProduct()?.name }} (ප්‍රමාණය: {{ selectedProduct() ? selectedSizes()[selectedProduct()!.id!] : '' }})</span> ඔබ වෙනුවෙන්ම වෙන්කර තබන්නෙමු.
            </span>
            <span *ngIf="currentLang() !== 'SI'">
              We will hold <span class="text-jackets-yellow">{{ selectedProduct()?.name }} (Size: {{ selectedProduct() ? selectedSizes()[selectedProduct()!.id!] : '' }})</span> for you at our Rathkarawwa showroom.
            </span>
          </p>

          <form [formGroup]="emailForm" (ngSubmit)="sendEmail()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">{{ t().modalNameLabel }}</label>
              <input formControlName="name" type="text" [placeholder]="currentLang() === 'SI' ? 'උදා. කමල් පෙරේරා' : 'e.g. Kamal Perera'" class="w-full bg-jackets-matte border border-jackets-carbon rounded-lg p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">{{ t().modalPhoneLabel }}</label>
              <input formControlName="phone" type="tel" placeholder="076 429 0833" class="w-full bg-jackets-matte border border-jackets-carbon rounded-lg p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">
                {{ t().modalDateLabel }}
              </label>
              <div class="relative cursor-pointer" (click)="datePicker.showPicker()">
                <input #datePicker
                       formControlName="visitDate" 
                       type="date" 
                       [min]="todayDate"
                       (click)="datePicker.showPicker()"
                       (keydown)="$event.preventDefault()"
                       class="w-full bg-jackets-matte border border-jackets-carbon rounded-lg p-2.5 pr-10 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition cursor-pointer [color-scheme:dark]" />
                <button type="button" 
                        (click)="datePicker.showPicker()" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-jackets-neon transition cursor-pointer text-base">
                  📅
                </button>
              </div>
              <p class="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <span>🗓️</span> {{ t().modalDateHint }}
              </p>
            </div>
            
            <button type="submit" [disabled]="emailForm.invalid || isEmailSending()" 
                    class="w-full mt-4 bg-jackets-neon hover:brightness-90 disabled:opacity-50 text-white font-black px-5 py-3 rounded-xl transition shadow-[0_0_15px_rgba(255,69,0,0.3)] cursor-pointer">
              {{ isEmailSending() ? t().modalSubmitting : t().modalSubmit }}
            </button>
          </form>
        </div>
      </div>

      <!-- 6. Floating Back to Top Button (Smooth Flowless Scrolling) -->
      <button *ngIf="showBackToTop()"
              (click)="scrollToTop()"
              type="button"
              aria-label="Scroll back to top"
              class="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-50 w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-jackets-neon to-red-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(255,69,0,0.5)] hover:shadow-[0_0_28px_rgba(255,69,0,0.7)] border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in cursor-pointer group">
        <svg class="w-5 h-5 text-white transform group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
      </button>

      <!-- 7. Mobile Sticky Bottom Action Bar -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414]/95 backdrop-blur-md border-t border-jackets-carbon p-3 flex gap-3 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <a [href]="'tel:' + PHONE_NUMBER" class="flex-1 bg-jackets-carbon border border-jackets-neon/60 hover:border-jackets-neon text-white font-black py-3 rounded-xl text-center text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer">
          📞 {{ t().callShop }}
        </a>
        <a [href]="getMobileWhatsAppUrl()" target="_blank" class="flex-1 bg-[#25D366] hover:bg-[#1ebd5a] text-black font-black py-3 rounded-xl text-center text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer">
          💬 WHATSAPP
        </a>
      </div>

    </div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    private adminService = inject(AdminProductService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);

    // Mobile Carousel Indices & Touch Gestures
    whySlideIndex = signal<number>(0);
    howSlideIndex = signal<number>(0);
    reviewSlideIndex = signal<number>(0);
    faqSlideIndex = signal<number>(0);
    mobileProductIndex = signal<number>(0);

    private whyTouchStartX = 0;
    private howTouchStartX = 0;
    private reviewTouchStartX = 0;
    private faqTouchStartX = 0;
    private productTouchStartX = 0;
    private autoSwipeInterval: any = null;

    allProducts = signal<Product[]>([]);
    isLoading = signal(true);
    showLoadingScreen = signal(true);
    isExitingLoadingScreen = signal(false);
    heroVisible = signal(false);
    private observer: IntersectionObserver | null = null;

    activeTab = signal<'ALL' | 'JACKET' | 'RAINCOAT'>('ALL');
    selectedMaterial = signal<string>('ALL');

    // Tracks selected size per product ID: e.g., { 1: 'XL', 2: 'M' }
    selectedSizes = signal<Record<number, string>>({});

    // EmailJS Modal State
    showEmailModal = signal(false);
    selectedProduct = signal<Product | null>(null);
    isEmailSending = signal(false);

    // CONTACT CONSTANTS - Direct call & WhatsApp
    readonly WHATSAPP_NUMBER = '94764290833';
    readonly PHONE_NUMBER = '+94764290833';

    // EMAILJS CONSTANTS (Configured dynamically via environment / .env)
    private readonly EMAILJS_SERVICE_ID = environment.emailJs.serviceId;
    private readonly EMAILJS_TEMPLATE_ID = environment.emailJs.templateId;
    private readonly EMAILJS_PUBLIC_KEY = environment.emailJs.publicKey;

    // Pre-calculated minimum date for visit (today)
    readonly todayDate = new Date().toISOString().split('T')[0];

    // Pagination State (6 products per page)
    readonly pageSize = 6;
    readonly Math = Math;
    currentPage = signal<number>(1);

    emailForm = this.fb.group({
        name: ['', Validators.required],
        phone: ['', Validators.required],
        visitDate: ['', Validators.required]
    });

    // FAQ Accordion State & Content
    openFaqIndex = signal<number | null>(0);
    isMobileMenuOpen = signal<boolean>(false);
    isAtTop = signal<boolean>(typeof window !== 'undefined' ? window.scrollY <= 20 : true);
    isScrolling = signal<boolean>(false);
    showBackToTop = signal<boolean>(false);
    private scrollStopTimeout: any = null;

    // Bilingual Language State ('EN' or 'SI')
    currentLang = signal<'EN' | 'SI'>((typeof localStorage !== 'undefined' && (localStorage.getItem('dilz_lang') as 'EN' | 'SI')) || 'EN');

    setLang(lang: 'EN' | 'SI') {
        this.currentLang.set(lang);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dilz_lang', lang);
        }
        this.cdr.markForCheck();
        this.refreshScrollReveal();
    }

    t = computed(() => {
        const isSi = this.currentLang() === 'SI';
        return isSi ? {
            brandCountry: 'ශ්‍රී ලංකාව',
            navCatalog: 'ඇඳුම් එකතුව',
            navWhy: 'ඇයි Dilz?',
            navHow: 'වෙන්කරන අයුරු',
            navMap: 'ප්‍රදර්ශනාගාරය',
            navFaq: 'නිතර අසන ප්‍රශ්න',
            call: 'අමතන්න',
            staff: 'කාර්ය මණ්ඩලය',
            tagline: 'ශ්‍රී ලංකා යතුරුපැදි ධාවකයන් සඳහා · රත්කරව්ව ප්‍රදර්ශනාගාරය',
            heroTitle1: 'ශ්‍රී ලංකාවේ වැසි සහ',
            heroTitle2: 'මහාමාර්ග සඳහාමයි',
            heroSubtitle: 'සුවිශේෂී ආරක්ෂිත යතුරුපැදි ජැකට් සහ 100% ජලරෝධී වැහි කබා. කිසිදු අත්තිකාරම් මුදලක් නොමැතිව වෙන්කරවා ගැනීමේ පහසුකම.',
            exploreBtn: 'ඇඳුම් එකතුව බලන්න',
            whatsappBtn: 'WhatsApp විමසීම්',
            whyTitle: 'ශ්‍රී ලංකාවේ මාර්ග සඳහාම නිපදවා ඇත',
            whySubtitle: 'අධික වර්ෂාවට ඔරොත්තු දෙන, අධික උෂ්ණත්වයට ඔරොත්තු දෙන සහ ප්‍රදර්ශනාගාරයෙන්ම ඇඳ බලා තෝරාගත හැක.',
            whyF1Title: '100% ජලරෝධී ආරක්ෂාව',
            whyF1Desc: 'අධික මෝසම් වැසිවලදී පවා කිසිදු ජල කාන්දුවක් සිදුනොවන හීට්-සීල් කරන ලද මැහුම් සහිත PVC සහ ඔක්ස්ෆර්ඩ් රෙදි.',
            whyF2Title: 'ධාවකයාගේ උපරිම ආරක්ෂාව',
            whyF2Desc: 'ප්‍රමිතියෙන් උසස් CE පැඩින් සහිත ආවරණ සහ ගෙවී යාමට ඔරොත්තු දෙන ශක්තිමත් කෝඩුරා (Cordura) රෙදි.',
            whyF3Title: 'ප්‍රදර්ශනාගාරයෙන්ම ඇඳ බලන්න',
            whyF3Desc: 'රත්කරව්ව අපගේ ප්‍රදර්ශනාගාරයට පැමිණ ඔබගේ හෙල්මට් සහ අත්වැසුම් සමඟම ඔබට වඩාත්ම ගැළපෙන ප්‍රමාණය තෝරාගන්න.',
            whyF4Title: 'දිවයින පුරා ඩිලිවරි පහසුකම්',
            whyF4Desc: 'ශ්‍රී ලංකාවේ ඕනෑම තැනකට කුරියර් මගින් භාණ්ඩ ලැබුණු පසු මුදල් ගෙවීමේ (COD) පහසුකම සමඟ ආරක්ෂිතව ගෙන්වා ගන්න.',
            catalogTitle: 'යතුරුපැදි ජැකට් සහ වැහි කබා එකතුව',
            catalogSubtitle: 'ඔබ කැමති භාණ්ඩය තෝරා, ප්‍රමාණය තෝරා කිසිදු අත්තිකාරමක් නොමැතිව වෙන්කරවා ගන්න.',
            tabAll: 'සියල්ල',
            tabJackets: 'යතුරුපැදි ජැකට්',
            tabRaincoats: 'වැහි කබා',
            allMaterials: 'සියලුම අමුද්‍රව්‍ය',
            materialLabel: 'අමුද්‍රව්‍ය:',
            unisexTag: 'කාන්තා / පිරිමි දෙපාර්ශවයටම',
            selectSizeNotice: 'ප්‍රමාණය තෝරන්න',
            clearSize: 'ඉවත් කරන්න',
            priceLabel: 'මිල',
            inStock: 'තොග ඇත',
            soldOut: 'තොග අවසන්',
            reserveWhatsapp: 'WhatsApp',
            reserveEmail: 'Email Hold',
            step1Notice: '👉 පළමුව ප්‍රමාණය තෝරන්න (WhatsApp හෝ Email)',
            step1Badge: 'පියවර 1',
            readyToHold: 'තෝරා ඇත · වෙන්කරවා ගැනීමට සූදානම්',
            resetBtn: 'නැවත මුල සිට',
            paginationShowing: 'පෙන්වන්නේ',
            paginationOf: 'අතරින්',
            paginationProducts: 'භාණ්ඩ',
            paginationPage: 'පිටුව',
            paginationPageOf: 'න්',
            prev: '‹ පෙර',
            next: 'ඊළඟ ›',
            howTitle: 'පියවර 3 කින් පහසුවෙන් වෙන්කරවා ගන්න',
            howSubtitle: 'කිසිදු අත්තිකාරම් මුදලක් නොමැත. අපි ඔබගේ ප්‍රමාණය අපගේ වැඩපොළෙහි වෙන්කර තබන්නෙමු.',
            howStep1Title: 'භාණ්ඩය සහ ප්‍රමාණය තෝරන්න',
            howStep1Desc: 'ඉහත එකතුවෙන් යතුරුපැදි ජැකට් හෝ වැහි කබා තෝරා ඔබගේ ප්‍රමාණය (S සිට 3XL දක්වා) තෝරන්න.',
            howStep2Title: 'වෙන්කරවා ගැනීම (1-Click Hold)',
            howStep2Desc: 'WhatsApp හෝ Email Hold මගින් ඔබ පැමිණෙන දිනය සඳහන් කර පහසුවෙන්ම වෙන්කරවා ගන්න.',
            howStep3Title: 'ඇඳ බලා රැගෙන යන්න',
            howStep3Desc: 'රත්කරව්ව අපගේ ප්‍රදර්ශනාගාරයට පැමිණ ඇඳ බලා රැගෙන යන්න, නැතහොත් නිවසටම ගෙන්වා ගන්න.',
            showroomTag: 'ප්‍රදර්ශනාගාර තොරතුරු',
            showroomTitle: 'නිල Dilz Jackets ප්‍රදර්ශනාගාරය',
            showroomSubtitle: 'රත්කරව්ව, මාස්පොත, කුරුණෑගල — ඔබගේ හෙල්මට් සහ අත්වැසුම් සමඟම ඇඳ බැලිය හැක.',
            showroomDesc: 'ඔබගේ හෙල්මට් සහ අත්වැසුම් සමඟම ඇඳ බලන්න. නොමිලේ යතුරුපැදි නැවතුම් පහසුකම් ඇත.',
            locLabel: 'ස්ථානය',
            locValue: 'රත්කරව්ව, මාස්පොත, කුරුණෑගල, ශ්‍රී ලංකාව',
            hoursLabel: 'විවෘත වේලාවන්',
            hoursValue: 'සඳුදා – සෙනසුරාදා: පෙ.ව. 8:00 – ප.ව. 6:00',
            phoneLabel: 'දුරකථන අංකය',
            directionsBtn: '📍 මඟ පෙන්වීම් (Map) ↗',
            showroomWhatsappBtn: '💬 WhatsApp',
            reviewsTitle: 'ධාවකයින්ගේ අදහස්',
            reviewsSubtitle: 'මෝසම් වැසි සහ දීර්ඝ චාරිකා මධ්‍යයේ ශ්‍රී ලාංකික මාර්ගවල අත්හදා බලන ලද විශිෂ්ට ගුණාත්මකභාවය.',
            faqTitle: 'නිතර අසන ප්‍රශ්න',
            faqSubtitle: 'ප්‍රමාණ, වැහි කබා සහ ප්‍රදර්ශනාගාරය පිළිබඳ ඉක්මන් පිළිතුරු.',
            footerLocation: 'රත්කරව්ව, කුරුණෑගල',
            footerCatalog: 'නිෂ්පාදන',
            footerMap: 'සිතියම',
            footerFaq: 'FAQ',
            footerCall: 'අමතන්න',
            footerStaff: 'කාර්යාලය',
            modalTitle: 'ඔබගේ ඇඳුම වෙන්කරවා ගන්න',
            modalSubtitle: 'අපගේ රත්කරව්ව ප්‍රදර්ශනාගාරයේදී ඔබ වෙනුවෙන්ම මෙය වෙන්කර තබන්නෙමු.',
            modalNameLabel: 'ඔබගේ සම්පූර්ණ නම',
            modalPhoneLabel: 'WhatsApp / දුරකථන අංකය',
            modalDateLabel: 'පැමිණීමට බලාපොරොත්තු වන දිනය (කැලැන්ඩරයෙන් තෝරන්න)',
            modalDateHint: 'කැලැන්ඩරය විවෘත කිරීමට මෙහි ස්පර්ශ කරන්න.',
            modalCancel: 'අවලංගු කරන්න',
            modalSubmit: 'වෙන්කරවා ගැනීම තහවුරු කරන්න (Email)',
            modalSubmitting: 'යවමින් පවතී...',
            callShop: 'දුරකථනයෙන් අමතන්න',
            languageLabel: 'භාෂාව / Language'
        } : {
            brandCountry: 'Sri Lanka',
            navCatalog: 'Gear Catalog',
            navWhy: 'Why Dilz',
            navHow: 'How to Reserve',
            navMap: 'Showroom Map',
            navFaq: 'FAQ',
            call: 'Call',
            staff: 'Staff',
            tagline: 'Sri Lankan Rider Gear · Rathkarawwa Showroom',
            heroTitle1: 'BUILT FOR THE',
            heroTitle2: 'MONSOON & HIGHWAY',
            heroSubtitle: 'Heavy-duty motorcycle riding jackets & 100% monsoon raincoats. Zero advance deposit required.',
            exploreBtn: 'Explore Catalog',
            whatsappBtn: 'WhatsApp Showroom',
            whyTitle: 'Built for Sri Lankan Roads',
            whySubtitle: 'Heavy monsoon protection, heat-resistant durability, and showroom test-fits.',
            whyF1Title: 'Monsoon Proof',
            whyF1Desc: 'Heat-welded seams and Oxford fabrics that never leak in torrential tropical rain.',
            whyF2Title: 'Rider Protection',
            whyF2Desc: 'Abrasion-resistant Cordura with impact armor compartments ready for CE protectors.',
            whyF3Title: 'Showroom Fit',
            whyF3Desc: 'Visit Rathkarawwa showroom to test arm reach and sizing with your helmet & gloves.',
            whyF4Title: 'Islandwide Courier',
            whyF4Desc: 'Fast courier dispatch to your doorstep anywhere in Sri Lanka with Cash on Delivery.',
            catalogTitle: 'Riding Jackets & Monsoon Raincoats',
            catalogSubtitle: 'Select your item, choose your size, and reserve it instantly at our showroom with zero advance deposit.',
            tabAll: 'ALL',
            tabJackets: 'MOTORCYCLE JACKETS',
            tabRaincoats: 'RAINCOATS',
            allMaterials: 'All Materials',
            materialLabel: 'Material:',
            unisexTag: 'UNISEX ADULT',
            selectSizeNotice: 'Select Size',
            clearSize: 'Clear',
            priceLabel: 'Price',
            inStock: 'In Stock',
            soldOut: 'Sold Out',
            reserveWhatsapp: 'WhatsApp',
            reserveEmail: 'Email Hold',
            step1Notice: '👉 Select size first to WhatsApp or Email',
            step1Badge: 'Step 1',
            readyToHold: 'Selected · Ready to Hold',
            resetBtn: 'Reset',
            paginationShowing: 'Showing',
            paginationOf: 'of',
            paginationProducts: 'products',
            paginationPage: 'Page',
            paginationPageOf: 'of',
            prev: '‹ Prev',
            next: 'Next ›',
            howTitle: 'Reserve in 3 Simple Steps',
            howSubtitle: 'Zero advance payment. We hold your exact size at our workshop.',
            howStep1Title: 'Pick Gear & Size',
            howStep1Desc: 'Browse riding jackets or raincoats above and select your size (S to 3XL).',
            howStep2Title: '1-Click Hold',
            howStep2Desc: 'Tap WhatsApp for direct showroom confirmation, or choose Email Hold with your visit date.',
            howStep3Title: 'Try & Ride Away',
            howStep3Desc: 'Visit our Rathkarawwa showroom to test fit in person, or request islandwide courier delivery.',
            showroomTag: 'Showroom Details',
            showroomTitle: 'Official Dilz Showroom',
            showroomSubtitle: 'Rathkarawwa, Maspotha, Kurunegala — test-fit gear and rainwear in person.',
            showroomDesc: 'Try jackets with your gloves & helmet. Free dedicated motorcycle parking on premises.',
            locLabel: 'Location',
            locValue: 'Rathkarawwa, Maspotha, Kurunegala, Sri Lanka',
            hoursLabel: 'Opening Hours',
            hoursValue: 'Monday – Saturday: 8:00 AM – 6:00 PM',
            phoneLabel: 'Direct Phone',
            directionsBtn: '📍 Directions ↗',
            showroomWhatsappBtn: '💬 WhatsApp',
            reviewsTitle: 'Rider Feedback',
            reviewsSubtitle: 'Tested on Sri Lankan roads through monsoon rain and long tours.',
            faqTitle: 'Frequently Asked Questions',
            faqSubtitle: 'Quick answers about sizing, rainwear, and showroom visits.',
            footerLocation: 'Rathkarawwa, Kurunegala',
            footerCatalog: 'Catalog',
            footerMap: 'Map',
            footerFaq: 'FAQ',
            footerCall: 'Call',
            footerStaff: 'Staff',
            modalTitle: 'Reserve Your Gear',
            modalSubtitle: 'We will hold this item for you at our Rathkarawwa showroom.',
            modalNameLabel: 'Your Full Name',
            modalPhoneLabel: 'WhatsApp / Contact Phone',
            modalDateLabel: 'Planned Visit Date (Pick from Calendar)',
            modalDateHint: 'Tap to open the calendar date picker.',
            modalCancel: 'Cancel',
            modalSubmit: 'Confirm Showroom Hold (Email)',
            modalSubmitting: 'Submitting Hold Request...',
            callShop: 'CALL SHOP',
            languageLabel: 'Language / භාෂාව'
        };
    });

    headerClasses = computed(() => {
        if (this.isAtTop()) {
            return 'translate-y-0 opacity-100 bg-transparent border-transparent';
        }
        if (this.isScrolling()) {
            return '-translate-y-full opacity-0 pointer-events-none bg-transparent border-transparent';
        }
        // When scrolling is stopped unless at the top most, show menu with opacity & glassmorphism
        return 'translate-y-0 opacity-95 hover:opacity-100 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]';
    });

    faqList = [
        {
            question: 'Can I visit the showroom in Rathkarawwa to try different sizes?',
            answer: 'Yes! Visit us in Rathkarawwa, Maspotha to try jackets with your gloves and gear, test arm reach, and ensure the ideal fit.'
        },
        {
            question: 'Are the raincoats 100% waterproof in heavy monsoon downpours?',
            answer: 'Yes. Constructed with heavy Oxford/PVC fabric, heat-sealed taped seams, and double storm flaps for zero water seepage.'
        },
        {
            question: 'Do you offer islandwide delivery across Sri Lanka?',
            answer: 'Yes, we provide courier delivery across all 9 provinces with Cash on Delivery (COD) and showroom pickup options.'
        },
        {
            question: 'How does the online showroom reservation work?',
            answer: 'Select your size, then tap WhatsApp or Email Hold. We reserve your item at our workshop with zero advance deposit.'
        },
        {
            question: 'What sizes are available in motorcycle jackets and raincoats?',
            answer: 'Standard sizes from S to 3XL. Message us on WhatsApp with your height and chest for instant sizing advice.'
        }
    ];

    currentFaqList = computed(() => {
        return this.currentLang() === 'SI' ? [
            {
                question: 'විවිධ ප්‍රමාණ (Sizes) ඇඳ බැලීමට රත්කරව්ව ප්‍රදර්ශනාගාරයට පැමිණිය හැකිද?',
                answer: 'ඔව්! කුරුණෑගල, මාස්පොත, රත්කරව්ව අපගේ ප්‍රදර්ශනාගාරයට පැමිණ ඔබගේ හෙල්මට් සහ අත්වැසුම් සමඟම ජැකට් සහ වැහි කබා ඇඳ බලා ඔබට නිවැරදිම ප්‍රමාණය තෝරාගත හැක.'
            },
            {
                question: 'අධික මෝසම් වැසිවලදී වැහි කබා 100% ක් ජලරෝධීද (Waterproof)?',
                answer: 'පැහැදිලිවම ඔව්. උසස් තත්ත්වයේ ඔක්ස්ෆර්ඩ් / PVC රෙදි, හීට්-සීල් කරන ලද ටේප් මැහුම් සහ ද්විත්ව සිපර් ආවරණ සහිතව කිසිදු ජල කාන්දුවක් සිදුනොවන පරිදි නිමවා ඇත.'
            },
            {
                question: 'ශ්‍රී ලංකාව පුරා ඩිලිවරි (Islandwide Delivery) පහසුකම් සපයනවාද?',
                answer: 'ඔව්, දිවයිනේ සියලුම පළාත් 9 සඳහා කුරියර් මගින් නිවසටම ගෙන්වා ගැනීමේ පහසුකම (භාණ්ඩ ලැබුණු පසු මුදල් ගෙවීමේ - Cash On Delivery පහසුකම සමඟ) හෝ ප්‍රදර්ශනාගාරයෙන් ලබා ගැනීමේ පහසුකම පවතී.'
            },
            {
                question: 'අන්තර්ජාලය හරහා ප්‍රදර්ශනාගාරය සඳහා වෙන්කරවා ගැනීම ක්‍රියාත්මක වන්නේ කෙසේද?',
                answer: 'ඔබට අවශ්‍ය භාණ්ඩය සහ ප්‍රමාණය තෝරා, WhatsApp හෝ Email Hold ක්ලික් කරන්න. කිසිදු අත්තිකාරම් මුදලක් තැන්පත් කිරීමකින් තොරව අපි එය ඔබ වෙනුවෙන් වෙන්කර තබන්නෙමු.'
            },
            {
                question: 'යතුරුපැදි ජැකට් සහ වැහි කබා සඳහා ලබා ගත හැකි ප්‍රමාණ මොනවාද?',
                answer: 'S සිට 3XL දක්වා සම්මත ප්‍රමාණ ලබාගත හැක. ඔබට වඩාත් ගැළපෙන ප්‍රමාණය තෝරාගැනීමට ඔබගේ උස සහ පපුවේ ප්‍රමාණය සඳහන් කර WhatsApp මගින් අප හා සම්බන්ධ වන්න.'
            }
        ] : this.faqList;
    });

    reviewsList = computed(() => {
        return this.currentLang() === 'SI' ? [
            {
                name: 'නිරෝෂන් කරුණාරත්න',
                role: 'Honda CB400 Tourer',
                text: 'කොළඹ සිට නුවරඑළිය දක්වා නොනවත්වා ඇදහැලුණු ධාරානිපාත වර්ෂාව මධ්‍යයේ පැද්දා. එක ජල බිඳක්වත් ඇතුළට කාන්දු වුණේ නෑ. ශ්‍රී ලංකාවේ හොඳම වැහි කබාය!'
            },
            {
                name: 'සහන් මධුසංක',
                role: 'Yamaha MT-15 · කුරුණෑගල',
                text: 'රත්කරව්ව ප්‍රදර්ශනාගාරයට ගිහින්ම අත්වැසුම් එක්ක ජැකට් එක ඇඳලා බැලුවා. කෝඩුරා මැහුම් සහ ආරක්ෂිත ආවරණ (Armor) ඉතාම ශක්තිමත්.'
            },
            {
                name: 'දිලිනි පෙරේරා',
                role: 'දිනපතා කාර්යාල ගමන් · කොළඹ',
                text: 'අධික වාහන තදබදය මැද රස්නය දැනෙන්නේ නැති ආරක්ෂිත ඇඳුමක්. WhatsApp මගින් සයිස් එක වෙන් කරලා දවස් 2 කින් ගෙදරටම ගෙන්නගත්තා.'
            }
        ] : [
            {
                name: 'Niroshan Karunaratne',
                role: 'Honda CB400 Tourer',
                text: 'Rode Colombo to Nuwara Eliya through non-stop heavy rain. Not a single drop seeped through — best rain gear in Sri Lanka.'
            },
            {
                name: 'Sahan Madusanka',
                role: 'Yamaha MT-15 · Kurunegala',
                text: 'Visited the Rathkarawwa showroom to test sizes with my gloves. Exceptional Cordura stitching and durable armor fit.'
            },
            {
                name: 'Dilini Perera',
                role: 'Daily Commuter · Colombo',
                text: 'Breathable, solid protection that does not overheat in traffic. Reserved on WhatsApp and delivered in 2 days.'
            }
        ];
    });

    trackByIndex(index: number): number {
        return index;
    }

    toggleFaq(index: number) {
        this.openFaqIndex.update(current => current === index ? null : index);
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }

    // Custom WhatsApp messages tailored for each section with Sinhala support
    getHeroWhatsAppUrl(): string {
        const isSi = this.currentLang() === 'SI';
        const message = isSi
            ? `ආයුබෝවන් DilzJackets! 👋 මම ඔබගේ වෙබ් අඩවිය නරඹමින් සිටින අතර, යතුරුපැදි ජැකට් සහ වැහි කබා පිළිබඳ වැඩිදුර විස්තර සහ දැනට තොග ඇති භාණ්ඩ පිළිබඳව දැනගැනීමට කැමැත්තෙමි. කරුණාකර විස්තර ලබාදිය හැකිද?`
            : `Hello DilzJackets! 👋 I am browsing your website and would like to inquire about your motorcycle jackets and raincoats collection. Could you please share more details and current stock availability?`;
        return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    getMapWhatsAppUrl(): string {
        const isSi = this.currentLang() === 'SI';
        const message = isSi
            ? `ආයුබෝවන් DilzJackets! 📍 මම රත්කරව්ව, මාස්පොත පිහිටි ඔබගේ ප්‍රදර්ශනාගාරයට පැමිණීමට බලාපොරොත්තු වෙමි. කරුණාකර ප්‍රදර්ශනාගාරය වෙත පැමිණෙන මාර්ගය සහ අද දින විවෘතව පවතින වේලාවන් තහවුරු කළ හැකිද?`
            : `Hello DilzJackets! 📍 I am planning to visit your showroom in Rathkarawwa, Maspotha. Could you please share location directions and confirm if the shop is open today?`;
        return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    getMobileWhatsAppUrl(): string {
        const isSi = this.currentLang() === 'SI';
        const message = isSi
            ? `ආයුබෝවන් DilzJackets! 🏍️ මම ඔබගේ වෙබ් අඩවියෙන් ඇඳුම් එකතුව නරඹමි. ප්‍රමාණ (Sizes) සහ රත්කරව්ව ෂෝරූම් එකට පැමිණීම පිළිබඳව කරුණු කිහිපයක් විමසීමට කැමැත්තෙමි.`
            : `Hello DilzJackets! 🏍️ I'm looking at your riding gear catalog on mobile. I have a few questions regarding sizes and visiting your shop in Rathkarawwa.`;
        return `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    readonly fallbackProducts: Product[] = [
        {
            id: 1,
            name: 'Apex Adventure Touring Jacket',
            productType: 'JACKET',
            material: '1000D Cordura Nylon',
            description: 'Heavy-duty touring jacket engineered for tropical heat and unexpected highway rain. CE Level 2 armor compartments.',
            priceLkr: 18500,
            imageUrls: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800'],
            inStock: true,
            availableSizes: ['M', 'L', 'XL', 'XXL']
        },
        {
            id: 2,
            name: 'StormGuard Pro Bikers Raincoat',
            productType: 'RAINCOAT',
            material: 'Triple-layer Ripstop PVC',
            description: '100% waterproof heavy monsoon raincoat with heat-welded seams, double storm flap zipper, and 3M night reflectors.',
            priceLkr: 6500,
            imageUrls: ['https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800'],
            inStock: true,
            availableSizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL']
        },
        {
            id: 3,
            name: 'Stealth Urban Commuter Jacket',
            productType: 'JACKET',
            material: 'Abrasion-Resistant Mesh + Cordura',
            description: 'Maximum airflow mesh design for daily Colombo and Kurunegala traffic with reinforced elbow and shoulder panels.',
            priceLkr: 14500,
            imageUrls: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800'],
            inStock: true,
            availableSizes: ['M', 'L', 'XL', 'XXL']
        },
        {
            id: 4,
            name: 'Monsoon Heavy Duty 2-Piece Rainsuit',
            productType: 'RAINCOAT',
            material: 'Heavy Oxford / PVC Coated',
            description: 'Full jacket and trouser set designed to withstand prolonged highway torrential monsoons with zero leaks.',
            priceLkr: 8900,
            imageUrls: ['https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800'],
            inStock: true,
            availableSizes: ['M', 'L', 'XL', 'XXL']
        },
        {
            id: 5,
            name: 'Desert & Mountain All-Weather Jacket',
            productType: 'JACKET',
            material: '600D Poly-Armor',
            description: 'Removable thermal inner liner with dual chest exhaust vents. Built for long-distance island tours.',
            priceLkr: 21500,
            imageUrls: ['https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=800'],
            inStock: true,
            availableSizes: ['L', 'XL', 'XXL']
        },
        {
            id: 6,
            name: 'Cyclone Ultralight Compact Raincoat',
            productType: 'RAINCOAT',
            material: 'Waterproof Hydrophobic Nylon',
            description: 'Packs into an under-seat pouch in 10 seconds. Essential quick-deployment rain gear for unexpected downpours.',
            priceLkr: 4800,
            imageUrls: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800'],
            inStock: true,
            availableSizes: ['S', 'M', 'L', 'XL']
        },
        {
            id: 7,
            name: 'Night-Rider Hi-Vis Armor Jacket',
            productType: 'JACKET',
            material: 'Fluorescent Cordura + Reflector Trim',
            description: 'Maximum visibility for misty hill-country rides and night highway touring with built-in CE back protector.',
            priceLkr: 17200,
            imageUrls: ['https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800'],
            inStock: true,
            availableSizes: ['M', 'L', 'XL']
        },
        {
            id: 8,
            name: 'AquaShield Deluxe Long Riding Coat',
            productType: 'RAINCOAT',
            material: 'Military-Grade Rubberized PVC',
            description: 'Extended knee-length rain protection with motorcycle saddle gusset for zero puddle splash ingress.',
            priceLkr: 7200,
            imageUrls: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800'],
            inStock: true,
            availableSizes: ['M', 'L', 'XL', 'XXL', '3XL']
        }
    ];

    ngOnInit() {
        this.adminService.getAllProducts().subscribe({
            next: (res) => {
                if (res && res.length > 0) {
                    this.allProducts.set(res);
                } else {
                    this.allProducts.set(this.fallbackProducts);
                }
            },
            error: (err) => {
                console.warn('Backend not reachable, loading curated showcase products:', err);
                this.allProducts.set(this.fallbackProducts);
            }
        });

        // 1. High-Impact Brand Loading Screen is held for 1.4s on load/refresh so user clearly sees the logo & neon loading bar
        setTimeout(() => {
            this.isExitingLoadingScreen.set(true);

            // Trigger Hero section entrance animation right as preloader begins to fade
            setTimeout(() => {
                this.heroVisible.set(true);
                this.cdr.markForCheck();
            }, 120);

            setTimeout(() => {
                this.showLoadingScreen.set(false);
                this.initScrollReveal();

                // 2. Keep 8 showroom skeletons shimmering for 1.2s so the user clearly sees the 8 skeletons loading
                setTimeout(() => {
                    this.isLoading.set(false);
                    this.refreshScrollReveal();
                }, 1200);
            }, 600);
        }, 1400);

        // Start auto-swiping carousels on mobile
        this.startAutoSwipers();
    }

    ngAfterViewInit() {
        this.initScrollReveal();
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.scrollStopTimeout) {
            clearTimeout(this.scrollStopTimeout);
        }
        if (this.autoSwipeInterval) {
            clearInterval(this.autoSwipeInterval);
            this.autoSwipeInterval = null;
        }
    }

    startAutoSwipers() {
        if (typeof window === 'undefined') return;
        this.autoSwipeInterval = setInterval(() => {
            this.ngZone.run(() => {
                // Auto-swipe Why Dilz right to left
                this.whySlideIndex.update(i => (i + 1) % 4);

                // Auto-swipe Rider Feedback right to left
                const revCount = this.reviewsList().length || 1;
                this.reviewSlideIndex.update(i => (i + 1) % revCount);

                // FAQ is strictly manually swiped by user request (not auto)
                this.cdr.markForCheck();
            });
        }, 3500);
    }

    // Direct navigation from footer to dashboard (if authenticated) or login (if not)
    navigateToAdmin() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/login']);
        }
    }

    // Touch Swipe Event Handlers for Mobile Carousels
    onWhyTouchStart(e: TouchEvent) {
        this.whyTouchStartX = e.changedTouches[0].screenX;
    }
    onWhyTouchEnd(e: TouchEvent) {
        const delta = this.whyTouchStartX - e.changedTouches[0].screenX;
        if (delta > 35) {
            this.whySlideIndex.update(i => (i + 1) % 4);
        } else if (delta < -35) {
            this.whySlideIndex.update(i => (i - 1 + 4) % 4);
        }
    }

    onHowTouchStart(e: TouchEvent) {
        this.howTouchStartX = e.changedTouches[0].screenX;
    }
    onHowTouchEnd(e: TouchEvent) {
        const delta = this.howTouchStartX - e.changedTouches[0].screenX;
        if (delta > 35) {
            this.nextHowSlide();
        } else if (delta < -35) {
            this.prevHowSlide();
        }
    }
    prevHowSlide() {
        this.howSlideIndex.update(i => (i - 1 + 3) % 3);
    }
    nextHowSlide() {
        this.howSlideIndex.update(i => (i + 1) % 3);
    }

    onReviewTouchStart(e: TouchEvent) {
        this.reviewTouchStartX = e.changedTouches[0].screenX;
    }
    onReviewTouchEnd(e: TouchEvent) {
        const total = this.reviewsList().length || 1;
        const delta = this.reviewTouchStartX - e.changedTouches[0].screenX;
        if (delta > 35) {
            this.reviewSlideIndex.update(i => (i + 1) % total);
        } else if (delta < -35) {
            this.reviewSlideIndex.update(i => (i - 1 + total) % total);
        }
    }

    onFaqTouchStart(e: TouchEvent) {
        this.faqTouchStartX = e.changedTouches[0].screenX;
    }
    onFaqTouchEnd(e: TouchEvent) {
        const delta = this.faqTouchStartX - e.changedTouches[0].screenX;
        if (delta > 35) {
            this.nextFaqSlide();
        } else if (delta < -35) {
            this.prevFaqSlide();
        }
    }
    prevFaqSlide() {
        const total = this.currentFaqList().length || 1;
        this.faqSlideIndex.update(i => (i - 1 + total) % total);
    }
    nextFaqSlide() {
        const total = this.currentFaqList().length || 1;
        this.faqSlideIndex.update(i => (i + 1) % total);
    }

    onProductTouchStart(e: TouchEvent) {
        this.productTouchStartX = e.changedTouches[0].screenX;
    }
    onProductTouchEnd(e: TouchEvent) {
        const delta = this.productTouchStartX - e.changedTouches[0].screenX;
        if (delta > 35) {
            this.nextMobileProduct();
        } else if (delta < -35) {
            this.prevMobileProduct();
        }
    }

    prevMobileProduct() {
        const total = this.paginatedProducts().length;
        if (total <= 0) return;
        this.mobileProductIndex.update(i => (i - 1 + total) % total);
    }

    nextMobileProduct() {
        const total = this.paginatedProducts().length;
        if (total <= 0) return;
        this.mobileProductIndex.update(i => (i + 1) % total);
    }

    initScrollReveal() {
        if (typeof window === 'undefined') return;
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
            return;
        }

        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                } else {
                    // Smoothly remove when scrolled out of view so scrolling back up/down re-animates
                    entry.target.classList.remove('is-revealed');
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '10px 0px 10px 0px'
        });

        this.refreshScrollReveal();
    }

    refreshScrollReveal() {
        if (typeof window === 'undefined') return;
        setTimeout(() => {
            if (!this.observer) return;
            const elements = document.querySelectorAll('.reveal-on-scroll');
            elements.forEach(el => this.observer?.observe(el));
        }, 80);
    }

    setTab(tab: 'ALL' | 'JACKET' | 'RAINCOAT') {
        this.activeTab.set(tab);
        this.selectedMaterial.set('ALL');
        this.currentPage.set(1);
        this.mobileProductIndex.set(0);
        this.refreshScrollReveal();
    }

    onMaterialChange(mat: string) {
        this.selectedMaterial.set(mat);
        this.currentPage.set(1);
        this.mobileProductIndex.set(0);
        this.refreshScrollReveal();
    }

    dynamicMaterials = computed(() => {
        let products = this.allProducts();
        if (this.activeTab() !== 'ALL') {
            products = products.filter(p => p.productType === this.activeTab());
        }
        return [...new Set(products.map(p => p.material))];
    });

    filteredProducts = computed(() => {
        let products = this.allProducts();
        if (this.activeTab() !== 'ALL') products = products.filter(p => p.productType === this.activeTab());
        if (this.selectedMaterial() !== 'ALL') products = products.filter(p => p.material === this.selectedMaterial());
        return products;
    });

    totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize) || 1);

    paginatedProducts = computed(() => {
        const products = this.filteredProducts();
        const start = (this.currentPage() - 1) * this.pageSize;
        return products.slice(start, start + this.pageSize);
    });

    totalPagesArray = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
        this.mobileProductIndex.set(0);
        this.refreshScrollReveal();
        const el = document.getElementById('showroom-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Transparent at top, hidden while actively scrolling, reappears with opacity when scrolling stops
    @HostListener('window:scroll')
    onWindowScroll() {
        const scrollPos = typeof window !== 'undefined'
            ? (window.pageYOffset || window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0)
            : 0;
        const atTop = scrollPos <= 20;
        this.isAtTop.set(atTop);
        this.showBackToTop.set(scrollPos > 300);
        this.isScrolling.set(true);

        // Control Hero section entrance/exit on scroll down & up
        if (scrollPos > 450 && this.heroVisible()) {
            this.heroVisible.set(false);
        } else if (scrollPos <= 250 && !this.heroVisible()) {
            this.heroVisible.set(true);
        }

        if (this.isMobileMenuOpen()) {
            this.isMobileMenuOpen.set(false);
        }

        if (this.scrollStopTimeout) {
            clearTimeout(this.scrollStopTimeout);
        }

        this.scrollStopTimeout = setTimeout(() => {
            this.ngZone.run(() => {
                this.isScrolling.set(false);
                this.cdr.markForCheck();
            });
        }, 150);
        this.cdr.markForCheck();
    }

    scrollToTop() {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Clear size on clicking outside product size controls or reservation buttons
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (
            target.closest('.size-selector-container') ||
            target.closest('.size-badge-btn') ||
            target.closest('.reservation-actions') ||
            target.closest('.email-modal-container')
        ) {
            return;
        }
        if (Object.keys(this.selectedSizes()).length > 0) {
            this.selectedSizes.set({});
        }
    }

    selectSize(productId: number, size: string) {
        this.selectedSizes.update(sizes => ({ ...sizes, [productId]: size }));
    }

    selectOrToggleSize(productId: number, size: string) {
        if (this.selectedSizes()[productId] === size) {
            this.clearSize(productId);
        } else {
            this.selectSize(productId, size);
        }
    }

    clearSize(productId: number) {
        this.selectedSizes.update(sizes => {
            const updated = { ...sizes };
            delete updated[productId];
            return updated;
        });
    }

    // Generate dynamic WhatsApp URL containing exact product details (Bilingual English & Sinhala)
    reserveViaWhatsApp(product: Product) {
        const size = this.selectedSizes()[product.id!];
        if (!size) {
            const alertMsg = this.currentLang() === 'SI'
                ? 'කරුණාකර වෙන්කරවා ගැනීමට පෙර ඔබට අවශ්‍ය ප්‍රමාණය (Size) තෝරන්න.'
                : 'Please select a size first before reserving.';
            alert(alertMsg);
            return;
        }
        const isSi = this.currentLang() === 'SI';
        const message = isSi
            ? `ආයුබෝවන් DilzJackets! 🏍️ මට රු. ${product.priceLkr} ක් වන *${product.name}* (අමුද්‍රව්‍ය: ${product.material}, ප්‍රමාණය: *${size}*) වෙන්කරවා ගැනීමට අවශ්‍යයි. රත්කරව්ව, මාස්පොත ප්‍රදර්ශනාගාරයට පැමිණ එය ඇඳ බැලීමට හැකි වන්නේ කවදාද?`
            : `Hello DilzJackets! 🏍️ I want to reserve the *${product.name}* (Material: ${product.material}, Size: *${size}*) priced at Rs.${product.priceLkr}. When can I visit the showroom in Rathkarawwa, Maspotha to try it on?`;
        const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    openEmailModal(product: Product) {
        const size = this.selectedSizes()[product.id!];
        if (!size) {
            const alertMsg = this.currentLang() === 'SI'
                ? 'කරුණාකර වෙන්කරවා ගැනීමට පෙර ඔබට අවශ්‍ය ප්‍රමාණය (Size) තෝරන්න.'
                : 'Please select a size first before reserving.';
            alert(alertMsg);
            return;
        }
        this.selectedProduct.set(product);
        this.showEmailModal.set(true);
        this.emailForm.reset();
    }

    sendEmail() {
        if (this.emailForm.invalid) return;
        this.isEmailSending.set(true);

        const formData = this.emailForm.value;
        const product = this.selectedProduct()!;
        const size = this.selectedSizes()[product.id!];

        // Data mapped directly to your EmailJS Template variables ({{from_name}}, {{phone}}, etc.)
        const templateParams = {
            from_name: formData.name,
            phone: formData.phone,
            visit_date: formData.visitDate,
            item_name: product.name,
            material: product.material,
            size: size,
            price: product.priceLkr
        };

        emailjs.send(this.EMAILJS_SERVICE_ID, this.EMAILJS_TEMPLATE_ID, templateParams, this.EMAILJS_PUBLIC_KEY)
            .then(() => {
                const successMsg = this.currentLang() === 'SI'
                    ? 'වෙන්කරවා ගැනීමේ ඉල්ලීම සාර්ථකව යවන ලදී! අපි ඔබව රත්කරව්ව ප්‍රදර්ශනාගාරයේදී හමුවෙමු.'
                    : 'Reservation sent successfully! We will see you at the shop.';
                alert(successMsg);
                this.showEmailModal.set(false);
            })
            .catch((err) => {
                console.error('EmailJS Error:', err);
                const errorMsg = this.currentLang() === 'SI'
                    ? 'වෙන්කරවා ගැනීම යැවීම අසාර්ථක විය. කරුණාකර WhatsApp මගින් අප හා සම්බන්ධ වන්න.'
                    : 'Failed to send reservation. Please contact us via WhatsApp.';
                alert(errorMsg);
            })
            .finally(() => {
                this.isEmailSending.set(false);
            });
    }
}
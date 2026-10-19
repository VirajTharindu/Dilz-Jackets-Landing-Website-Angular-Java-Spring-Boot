import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminProductService, Product } from '../core/services/admin-product.service';
import { AuthService } from '../core/services/auth.service';
import { ProductModalComponent } from './product-model.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProductModalComponent, RouterLink],
  template: `
        <div class="min-h-screen bg-jackets-matte text-white p-6">
  <div class="max-w-7xl mx-auto">
    
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8 border-b border-jackets-carbon pb-6">
      
      <!-- Left: Logo & Main Inventory Dashboard Title -->
      <div class="flex items-center gap-4">
        <!-- Brand Logo (links to website) -->
        <a routerLink="/" title="View website" class="group flex-shrink-0">
          <img src="assets/DilzJackets_Logo_web.png" 
               alt="DilzJackets Logo" 
               class="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,69,0,0.35)] group-hover:scale-105 transition-transform" />
        </a>

        <div>
          <!-- Brand Badge / Context -->
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-black tracking-wider text-gray-300 uppercase">
              DILZ <span class="text-jackets-neon">JACKETS</span>
            </span>
            <span class="text-gray-600">·</span>
            <span class="text-[11px] text-gray-500 font-medium">Rathkarawwa Shop</span>
          </div>

          <!-- Prominent Main Title -->
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase leading-tight drop-shadow">
            INVENTORY DASHBOARD
          </h1>

          <!-- Location Info -->
          <p class="text-xs text-gray-400 mt-1 font-medium">
            Rathkarawwa, Kurunegala · Real-time stock & reservation control
          </p>
        </div>
      </div>

      <!-- Right: Action Controls & Login Session Status -->
      <div class="flex items-center flex-wrap gap-2.5 sm:gap-3">
        <!-- Login Session Status Pill (prominently placed beside Logout) -->
        <div class="flex items-center gap-2 bg-[#1c1c1c] border border-amber-400/35 text-amber-300 px-3.5 py-2.5 rounded-lg text-xs font-mono font-bold shadow-inner">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <span class="text-gray-400 text-[11px] font-sans uppercase font-bold tracking-wider">Session:</span>
          <span class="text-amber-300 font-mono font-black">{{ formatRemainingTime() }}</span>
        </div>

        <!-- Direct link to navigate back to Home Page -->
        <a routerLink="/" 
           class="border border-white/20 text-gray-300 hover:text-white hover:border-white px-4 py-2.5 rounded-lg font-bold text-xs tracking-wider transition flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 active:scale-95">
          🏠 VIEW WEBSITE
        </a>

        <!-- Using jackets-neon for the primary add button -->
        <button (click)="openAddModal()" 
                class="bg-jackets-neon hover:bg-[#e03e00] text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 text-xs tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer">
          + ADD NEW ITEM
        </button>

        <!-- Logout button -->
        <button (click)="auth.logout()" 
                class="border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2.5 rounded-lg font-bold text-xs tracking-wider transition cursor-pointer active:scale-95">
          Logout
        </button>
      </div>

    </div>

    <!-- Inventory Table -->
    <div class="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-jackets-carbon">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-jackets-carbon text-gray-400 text-xs uppercase tracking-wider">
            <th class="p-4">Item</th>
            <th class="p-4">Type</th>
            <th class="p-4">Material</th>
            <th class="p-4">Sizes</th>
            <th class="p-4">Price (LKR)</th>
            <th class="p-4">Status</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-jackets-carbon text-sm">
          <tr *ngIf="products().length === 0">
            <td colspan="7" class="p-8 text-center text-gray-500">
              No products found in catalog. Click <button (click)="openAddModal()" class="text-jackets-neon underline font-bold">Add New Item</button> to add your first product.
            </td>
          </tr>
          <tr *ngFor="let p of products()" class="hover:bg-[#222] transition">
            <td class="p-4 flex items-center gap-3">
              <img [src]="(p.imageUrls && p.imageUrls[0]) || 'https://via.placeholder.com/80'" 
                   class="w-12 h-12 rounded object-cover border border-[#333]" />
              <span class="font-bold text-white">{{ p.name }}</span>
            </td>
            <td class="p-4">
              <span class="px-2.5 py-1 rounded text-xs font-semibold"
                    [ngClass]="p.productType === 'JACKET' ? 'bg-orange-500/25 text-orange-400' : 'bg-blue-500/25 text-blue-400'">
                {{ p.productType }}
              </span>
            </td>
            <td class="p-4 text-gray-300">{{ p.material }}</td>
            <td class="p-4">
              <!-- Using jackets-carbon for size tags -->
              <span *ngFor="let s of p.availableSizes || []" 
                    class="inline-block bg-jackets-carbon px-1.5 py-0.5 rounded text-xs mr-1 text-gray-300">
                {{ s }}
              </span>
            </td>
            <!-- Using jackets-yellow for the price -->
            <td class="p-4 font-mono font-bold text-jackets-yellow">
              Rs. {{ p.priceLkr | number:'1.2-2' }}
            </td>
            <td class="p-4">
              <button (click)="toggleStock(p)"
                      [ngClass]="p.inStock ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'"
                      class="border text-xs px-2.5 py-1 rounded font-bold transition">
                {{ p.inStock ? 'IN STOCK' : 'OUT OF STOCK' }}
              </button>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <button (click)="openEditModal(p)" 
                      class="text-jackets-yellow hover:text-yellow-300 font-bold text-xs mr-3 transition">
                Modify
              </button>
              <button (click)="deleteItem(p)" 
                      class="text-red-400 hover:text-red-300 font-bold text-xs transition">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <app-product-modal *ngIf="showModal()" 
                     [productToEdit]="selectedProductForEdit()"
                     (close)="closeModal()" 
                     (saved)="onItemSaved()">
  </app-product-modal>
</div>

    `

})

export class DashboardComponent implements OnInit, OnDestroy {
  adminService = inject(AdminProductService);
  auth = inject(AuthService);

  products = signal<Product[]>([]);
  showModal = signal<boolean>(false);
  selectedProductForEdit = signal<Product | null>(null);

  remainingMs = signal<number>(this.auth.getRemainingSessionMs());
  private sessionTimer: any = null;
  private autoLogoutTimeout: any = null;

  ngOnInit() {
    if (!this.auth.isAuthenticated()) {
      this.auth.logout();
      return;
    }

    this.loadCatalog();
    this.initSessionTimer();
  }

  ngOnDestroy() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    if (this.autoLogoutTimeout) {
      clearTimeout(this.autoLogoutTimeout);
    }
  }

  initSessionTimer() {
    const msLeft = this.auth.getRemainingSessionMs();
    this.remainingMs.set(msLeft);

    // Auto logout when 15 minutes expires
    this.autoLogoutTimeout = setTimeout(() => {
      alert('Your admin session has expired (15 minutes). Redirecting to homepage...');
      this.auth.logout();
    }, msLeft);

    // Update countdown every second
    this.sessionTimer = setInterval(() => {
      const remaining = this.auth.getRemainingSessionMs();
      this.remainingMs.set(remaining);
      if (remaining <= 0) {
        clearInterval(this.sessionTimer);
      }
    }, 1000);
  }

  formatRemainingTime(): string {
    const totalSec = Math.floor(this.remainingMs() / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  loadCatalog() {
    this.adminService.getAllProducts().subscribe({
      next: (res) => this.products.set(res || []),
      error: (err) => console.error('Failed to load catalog:', err)
    });
  }

  openAddModal() {
    this.selectedProductForEdit.set(null);
    this.showModal.set(true);
  }

  openEditModal(item: Product) {
    if (!confirm(`Do you want to modify product "${item.name}"?`)) {
      return;
    }
    this.selectedProductForEdit.set(item);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedProductForEdit.set(null);
  }

  onItemSaved() {
    this.closeModal();
    this.loadCatalog();
  }

  toggleStock(item: Product) {
    const action = item.inStock ? 'mark as OUT OF STOCK' : 'mark as IN STOCK';
    if (!confirm(`Are you sure you want to modify stock status to ${action} for "${item.name}"?`)) {
      return;
    }

    const updated = { ...item, inStock: !item.inStock };
    this.adminService.updateProduct(item.id!, updated).subscribe({
      next: () => this.loadCatalog(),
      error: (err) => console.error('Failed to toggle stock status:', err)
    });
  }

  deleteItem(item: Product) {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    this.adminService.deleteProduct(item.id!).subscribe({
      next: () => this.loadCatalog(),
      error: (err) => console.error('Failed to delete product:', err)
    });
  }

}

import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminProductService, Product } from '../core/services/admin-product.service';

@Component({
    selector: 'app-product-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
   <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div class="bg-[#1a1a1a] border border-jackets-carbon rounded-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-black text-white">
        {{ productToEdit ? 'MODIFY PRODUCT' : 'ADD PRODUCT TO CATALOG' }}
      </h2>
      <button type="button" (click)="close.emit()" class="text-gray-400 hover:text-white text-lg font-bold">✕</button>
    </div>

    <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-4">
      
      <!-- Name -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Product Name</label>
        <input formControlName="name" type="text" placeholder="e.g. Cordura High-Vis Biker Jacket" 
               class="w-full bg-jackets-matte border border-jackets-carbon rounded p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
      </div>

      <!-- Type & Material Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Type</label>
          <select formControlName="productType" 
                  class="w-full bg-jackets-matte border border-jackets-carbon rounded p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition">
            <option value="JACKET">Jacket</option>
            <option value="RAINCOAT">Raincoat</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Material</label>
          <input formControlName="material" type="text" placeholder="e.g. 600D Heavy Cordura" 
                 class="w-full bg-jackets-matte border border-jackets-carbon rounded p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
        </div>
      </div>

      <!-- Price -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Price in LKR</label>
        <input formControlName="priceLkr" type="number" placeholder="28500" 
               class="w-full bg-jackets-matte border border-jackets-carbon rounded p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition" />
      </div>

      <!-- Size Checkboxes -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase mb-2">Available Adult Sizes</label>
        <div class="flex flex-wrap gap-3">
          <label *ngFor="let size of allSizes" 
                 class="flex items-center gap-2 cursor-pointer bg-jackets-matte px-3 py-1.5 rounded border border-jackets-carbon hover:border-gray-500 transition">
            <input type="checkbox" [value]="size" 
                   [checked]="selectedSizes.includes(size)"
                   (change)="onSizeChange($event)" 
                   class="accent-jackets-neon w-4 h-4 cursor-pointer" />
            <span class="text-sm font-semibold">{{ size }}</span>
          </label>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
        <textarea formControlName="description" rows="3" placeholder="Ventilated inner mesh, CE Level 2 armor pockets..." 
                  class="w-full bg-jackets-matte border border-jackets-carbon rounded p-2.5 text-white focus:border-jackets-neon focus:ring-1 focus:ring-jackets-neon outline-none transition"></textarea>
      </div>

      <!-- Existing / Uploaded Images Preview -->
      <div *ngIf="uploadedUrls.length > 0" class="space-y-2">
        <label class="block text-xs font-semibold text-gray-400 uppercase">Product Images</label>
        <div class="flex flex-wrap gap-3">
          <div *ngFor="let url of uploadedUrls; let idx = index" class="relative group">
            <img [src]="url" class="w-16 h-16 rounded object-cover border border-jackets-carbon" />
            <button type="button" (click)="removeImage(idx)" 
                    class="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition">
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Cloudinary Upload Box -->
      <div class="border-2 border-dashed border-jackets-carbon rounded-lg p-4 text-center bg-jackets-matte/50">
        <input type="file" (change)="uploadToCloudinary($event)" accept="image/*" class="hidden" #fileInput />
        <button type="button" (click)="fileInput.click()" 
                [disabled]="uploading"
                class="bg-jackets-carbon hover:brightness-125 text-sm text-gray-300 px-4 py-2 rounded transition font-bold disabled:opacity-50">
          {{ uploading ? 'Uploading to Cloudinary...' : 'Upload Image to Cloudinary' }}
        </button>
        <p *ngIf="uploadedUrls.length > 0" class="text-xs text-emerald-400 mt-2 font-mono font-bold">
          ✓ {{ uploadedUrls.length }} image(s) linked
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-jackets-carbon">
        <button type="button" (click)="close.emit()" 
                class="px-4 py-2 text-sm text-gray-400 hover:text-white transition font-bold">
          Cancel
        </button>
        <button type="submit" [disabled]="productForm.invalid || uploading" 
                class="bg-jackets-neon hover:brightness-90 disabled:opacity-50 text-white font-black px-5 py-2 rounded text-sm transition shadow-[0_0_10px_rgba(255,69,0,0.2)]">
          {{ productToEdit ? 'SAVE MODIFICATIONS' : 'SAVE PRODUCT' }}
        </button>
      </div>
      
    </form>
  </div>
</div>
  `
})
export class ProductModalComponent implements OnInit {
    @Input() productToEdit: Product | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private productService = inject(AdminProductService);

    readonly allSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
    selectedSizes: string[] = [];
    uploadedUrls: string[] = [];
    uploading = false;

    // Cloudinary credentials
    private readonly CLOUD_NAME = 'z0iwvoij';
    private readonly UPLOAD_PRESET = 'dilz_jackets_preset';

    productForm = this.fb.group({
        name: ['', Validators.required],
        productType: ['JACKET', Validators.required],
        material: ['', Validators.required],
        priceLkr: [null as number | null, [Validators.required, Validators.min(0)]],
        description: ['']
    });

    ngOnInit() {
        if (this.productToEdit) {
            this.productForm.patchValue({
                name: this.productToEdit.name,
                productType: this.productToEdit.productType,
                material: this.productToEdit.material,
                priceLkr: this.productToEdit.priceLkr,
                description: this.productToEdit.description || ''
            });
            this.selectedSizes = [...(this.productToEdit.availableSizes || [])];
            this.uploadedUrls = [...(this.productToEdit.imageUrls || [])];
        }
    }

    onSizeChange(event: Event) {
        const checkbox = event.target as HTMLInputElement;
        if (checkbox.checked) {
            if (!this.selectedSizes.includes(checkbox.value)) {
                this.selectedSizes.push(checkbox.value);
            }
        } else {
            this.selectedSizes = this.selectedSizes.filter(s => s !== checkbox.value);
        }
    }

    removeImage(index: number) {
        if (!confirm('Are you sure you want to remove this image?')) {
            return;
        }
        this.uploadedUrls.splice(index, 1);
    }

    uploadToCloudinary(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        this.uploading = true;
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.UPLOAD_PRESET);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;

        this.http.post<any>(uploadUrl, formData).subscribe({
            next: (res) => {
                this.uploadedUrls.push(res.secure_url);
                this.uploading = false;
            },
            error: () => {
                alert('Image upload failed. Check your Cloud Name and Unsigned Preset.');
                this.uploading = false;
            }
        });
    }

    onSubmit() {
        if (this.productForm.invalid) return;

        const formVal = this.productForm.value;

        if (this.productToEdit) {
            // Confirmation before saving modifications
            if (!confirm(`Are you sure you want to save modifications to "${formVal.name}"?`)) {
                return;
            }

            const updatedProduct: Product = {
                ...this.productToEdit,
                name: formVal.name!,
                productType: formVal.productType as 'JACKET' | 'RAINCOAT',
                material: formVal.material!,
                priceLkr: Number(formVal.priceLkr),
                description: formVal.description || '',
                availableSizes: this.selectedSizes,
                imageUrls: this.uploadedUrls.length > 0 ? this.uploadedUrls : (this.productToEdit.imageUrls || ['https://via.placeholder.com/400']),
                inStock: this.productToEdit.inStock ?? true
            };

            this.productService.updateProduct(this.productToEdit.id!, updatedProduct).subscribe({
                next: () => this.saved.emit(),
                error: (err) => {
                    console.error('Failed to update product', err);
                    alert('Failed to update product. Please check console for details.');
                }
            });
        } else {
            // Confirmation before adding new product
            if (!confirm(`Are you sure you want to add "${formVal.name}" to the catalog?`)) {
                return;
            }

            const newProduct: Product = {
                name: formVal.name!,
                productType: formVal.productType as 'JACKET' | 'RAINCOAT',
                material: formVal.material!,
                priceLkr: Number(formVal.priceLkr),
                description: formVal.description || '',
                availableSizes: this.selectedSizes,
                imageUrls: this.uploadedUrls.length > 0 ? this.uploadedUrls : ['https://via.placeholder.com/400'],
                inStock: true
            };

            this.productService.createProduct(newProduct).subscribe({
                next: () => this.saved.emit(),
                error: (err) => {
                    console.error('Failed to create product', err);
                    alert('Failed to create product. Please check console for details.');
                }
            });
        }
    }
}
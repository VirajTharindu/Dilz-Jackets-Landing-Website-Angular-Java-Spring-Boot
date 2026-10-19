import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
    id?: number;
    name: string;
    productType: 'JACKET' | 'RAINCOAT';
    material: string;
    description: string;
    priceLkr: number;
    imageUrls: string[];
    inStock: boolean;
    availableSizes: string[];
}


@Injectable({ providedIn: 'root' })
export class AdminProductService {
    private readonly API = environment.apiBaseUrl;
    private http = inject(HttpClient);

    getAllProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.API}/products`);
    }

    createProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(`${this.API}/admin/products`, product);
    }

    updateProduct(id: number, product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.API}/admin/products/${id}`, product);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API}/admin/products/${id}`);
    }
}
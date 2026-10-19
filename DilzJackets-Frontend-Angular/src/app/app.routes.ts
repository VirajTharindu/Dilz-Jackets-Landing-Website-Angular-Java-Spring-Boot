import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Component } from '@angular/core';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home.component').then(m => m.HomeComponent),
    },
    {
        path: 'admin',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login.component').then(m => m.LoginComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];

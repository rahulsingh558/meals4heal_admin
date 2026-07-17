import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppSettings {
    restaurantName: string;
    email: string;
    phone: string;
    address: string;
    deliveryRadius: number;
    taxRate: number;
    deliveryCharge: number;
    freeDeliveryThreshold: number;
    openingTime: string;
    closingTime: string;
    notificationEnabled: boolean;
    lowStockAlert: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private apiUrl = `${environment.apiUrl}/settings`;

    constructor(private http: HttpClient) {}

    getSettings(): Observable<{ success: boolean; settings: AppSettings }> {
        return this.http.get<any>(this.apiUrl);
    }

    updateSettings(settings: Partial<AppSettings>): Observable<{ success: boolean; message: string; settings: AppSettings }> {
        return this.http.put<any>(this.apiUrl, settings);
    }

    resetSettings(): Observable<{ success: boolean; message: string; settings: AppSettings }> {
        return this.http.post<any>(`${this.apiUrl}/reset`, {});
    }

    clearAllData(): Observable<{ success: boolean; message: string; deleted: any }> {
        return this.http.post<any>(`${this.apiUrl}/clear-data`, { confirm: 'DELETE' });
    }
}

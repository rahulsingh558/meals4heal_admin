import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Lightweight event bus so the shared layout header can trigger actions
 * (export, refresh) on whichever page is currently routed.
 */
@Injectable({ providedIn: 'root' })
export class AdminBusService {
    private exportOrdersSubject = new Subject<void>();
    private refreshDashboardSubject = new Subject<void>();

    exportOrders$ = this.exportOrdersSubject.asObservable();
    refreshDashboard$ = this.refreshDashboardSubject.asObservable();

    emitExportOrders() { this.exportOrdersSubject.next(); }
    emitRefreshDashboard() { this.refreshDashboardSubject.next(); }
}

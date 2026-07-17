import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toastsSubject.asObservable();
    private counter = 0;

    private push(type: Toast['type'], title: string, message?: string, duration = 3500) {
        const toast: Toast = { id: ++this.counter, type, title, message };
        this.toastsSubject.next([...this.toastsSubject.value, toast]);
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast.id), duration);
        }
    }

    success(title: string, message?: string) { this.push('success', title, message); }
    error(title: string, message?: string) { this.push('error', title, message, 5000); }
    info(title: string, message?: string) { this.push('info', title, message); }
    warning(title: string, message?: string) { this.push('warning', title, message); }

    dismiss(id: number) {
        this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
    }
}

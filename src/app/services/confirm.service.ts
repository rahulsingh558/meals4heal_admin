import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    /** If set, the user must type this exact text to enable the confirm button. */
    requireText?: string;
}

interface ConfirmState extends ConfirmOptions {
    open: boolean;
    resolve?: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    private stateSubject = new BehaviorSubject<ConfirmState>({
        open: false, title: '', message: ''
    });
    public state$ = this.stateSubject.asObservable();

    /** Opens a confirm dialog and resolves true/false when the user chooses. */
    ask(options: ConfirmOptions): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.stateSubject.next({
                ...options,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                open: true,
                resolve,
            });
        });
    }

    respond(value: boolean) {
        const current = this.stateSubject.value;
        current.resolve?.(value);
        this.stateSubject.next({ open: false, title: '', message: '' });
    }
}

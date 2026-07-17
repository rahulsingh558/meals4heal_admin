import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[100] space-y-3 w-80 max-w-[calc(100vw-2rem)]">
      <div *ngFor="let t of toastService.toasts$ | async"
        class="flex items-start gap-3 p-4 rounded-lg shadow-lg border bg-white animate-[slidein_0.2s_ease-out]"
        [ngClass]="{
          'border-l-4 border-l-green-500': t.type === 'success',
          'border-l-4 border-l-red-500': t.type === 'error',
          'border-l-4 border-l-blue-500': t.type === 'info',
          'border-l-4 border-l-yellow-500': t.type === 'warning'
        }">
        <div class="flex-shrink-0 mt-0.5">
          <span [ngSwitch]="t.type" class="text-lg">
            <span *ngSwitchCase="'success'">✅</span>
            <span *ngSwitchCase="'error'">⛔</span>
            <span *ngSwitchCase="'warning'">⚠️</span>
            <span *ngSwitchDefault>ℹ️</span>
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900">{{ t.title }}</p>
          <p *ngIf="t.message" class="text-xs text-gray-600 mt-0.5">{{ t.message }}</p>
        </div>
        <button (click)="toastService.dismiss(t.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slidein {
      from { opacity: 0; transform: translateX(1rem); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}

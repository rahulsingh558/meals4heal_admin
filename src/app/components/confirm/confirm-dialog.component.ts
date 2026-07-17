import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="(confirm.state$ | async) as s">
      <div *ngIf="s.open" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="cancel()"></div>
        <div class="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            [ngClass]="s.danger ? 'bg-red-100' : 'bg-green-100'">
            {{ s.danger ? '⚠️' : '❓' }}
          </div>
          <h3 class="text-lg font-bold text-center text-gray-900 mb-2">{{ s.title }}</h3>
          <p class="text-sm text-gray-600 text-center mb-4">{{ s.message }}</p>

          <div *ngIf="s.requireText" class="mb-4">
            <label class="block text-xs text-gray-500 mb-1 text-center">
              Type <span class="font-mono font-bold">{{ s.requireText }}</span> to confirm
            </label>
            <input [(ngModel)]="typed" type="text"
              class="w-full border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2"
              [ngClass]="s.danger ? 'focus:ring-red-300' : 'focus:ring-green-300'" />
          </div>

          <div class="flex gap-2">
            <button (click)="cancel()"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              {{ s.cancelText }}
            </button>
            <button (click)="ok()" [disabled]="!!s.requireText && typed !== s.requireText"
              class="flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              [ngClass]="s.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'">
              {{ s.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  typed = '';
  constructor(public confirm: ConfirmService) {}

  ok() {
    this.typed = '';
    this.confirm.respond(true);
  }

  cancel() {
    this.typed = '';
    this.confirm.respond(false);
  }
}

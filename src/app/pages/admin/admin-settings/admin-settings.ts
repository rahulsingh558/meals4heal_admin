import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService, AppSettings } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmService } from '../../../services/confirm.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
})
export class AdminSettingsComponent implements OnInit {
  settings: AppSettings = {
    restaurantName: 'meals4heal',
    email: 'admin@meals4heal.in',
    phone: '+91 8151070458',
    address: '123 Healthy Street, Nutrition City',
    deliveryRadius: 5,
    taxRate: 5,
    deliveryCharge: 30,
    freeDeliveryThreshold: 299,
    openingTime: '10:00',
    closingTime: '22:00',
    notificationEnabled: true,
    lowStockAlert: 10
  };

  loading = true;
  saving = false;
  resetting = false;
  clearing = false;

  constructor(
    private settingsService: SettingsService,
    private toast: ToastService,
    private confirm: ConfirmService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSettings();
    }
  }

  loadSettings() {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.settings) {
          this.settings = { ...this.settings, ...res.settings };
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Load failed', 'Could not load settings from the server.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveSettings() {
    this.saving = true;
    this.settingsService.updateSettings(this.settings).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.settings = { ...this.settings, ...res.settings };
          this.toast.success('Settings saved', 'Your changes are now live.');
        } else {
          this.toast.error('Save failed', res.message || 'Please try again.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.toast.error('Save failed', 'Could not save settings. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  async resetSettings() {
    const ok = await this.confirm.ask({
      title: 'Reset settings?',
      message: 'This reverts all settings to their factory defaults.',
      confirmText: 'Reset',
      danger: true
    });
    if (!ok) return;

    this.resetting = true;
    this.settingsService.resetSettings().subscribe({
      next: (res) => {
        this.resetting = false;
        if (res.success) {
          this.settings = { ...this.settings, ...res.settings };
          this.toast.success('Settings reset', 'Defaults have been restored.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.resetting = false;
        this.toast.error('Reset failed', 'Could not reset settings.');
        this.cdr.detectChanges();
      }
    });
  }

  async clearAllData() {
    const ok = await this.confirm.ask({
      title: 'Clear ALL data?',
      message: 'This permanently deletes all orders, reviews, carts, notifications, menu items and customer accounts. This cannot be undone.',
      confirmText: 'Delete everything',
      danger: true,
      requireText: 'DELETE'
    });
    if (!ok) return;

    this.clearing = true;
    this.settingsService.clearAllData().subscribe({
      next: (res) => {
        this.clearing = false;
        if (res.success) {
          const d = res.deleted || {};
          this.toast.success(
            'Data cleared',
            `Removed ${d.orders || 0} orders, ${d.menuItems || 0} menu items, ${d.customers || 0} customers.`
          );
        } else {
          this.toast.error('Clear failed', res.message || 'Please try again.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.clearing = false;
        this.toast.error('Clear failed', 'Could not clear data. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }
}

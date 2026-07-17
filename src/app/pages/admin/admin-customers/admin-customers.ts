import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrderService, Order } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { downloadCsv } from '../../../utils/csv.util';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder: string | null;
  status: 'active' | 'inactive';
  memberSince: string;
}

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customers.html',
})
export class AdminCustomersComponent implements OnInit, OnDestroy {
  searchQuery = '';
  customers: Customer[] = [];
  loading = true;
  error = '';

  // Detail modal
  selectedCustomer: Customer | null = null;
  customerOrders: Order[] = [];
  ordersLoading = false;

  private routeSub?: Subscription;

  constructor(
    private http: HttpClient,
    private orderService: OrderService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCustomers();
      this.routeSub = this.route.queryParams.subscribe(params => {
        if (params['q']) this.searchQuery = params['q'];
      });
    }
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  loadCustomers() {
    this.loading = true;
    this.error = '';
    this.http.get<{ success: boolean; customers: Customer[] }>(
      `${environment.apiUrl}/admin/customers`
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.customers = res.customers;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.error = 'Failed to load customers. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredCustomers() {
    if (!this.searchQuery) return this.customers;
    const query = this.searchQuery.toLowerCase();
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  }

  get totalCustomers() { return this.customers.length; }

  get activeCustomers() {
    return this.customers.filter(c => c.status === 'active').length;
  }

  get totalRevenue() {
    return this.customers.reduce((sum, c) => sum + c.totalSpent, 0);
  }

  formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  /* ============================
     CUSTOMER DETAIL
  ============================= */
  openCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    this.customerOrders = [];
    this.ordersLoading = true;

    this.orderService.getAllOrders({ userId: customer._id, limit: 100, sortBy: '-createdAt' }).subscribe({
      next: (res) => {
        this.customerOrders = res.success ? res.orders : [];
        this.ordersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ordersLoading = false;
        this.toast.error('Load failed', 'Could not load this customer\'s orders.');
        this.cdr.detectChanges();
      }
    });
  }

  closeCustomer() {
    this.selectedCustomer = null;
    this.customerOrders = [];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
    };
    return map[status] || status;
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  /** Export the (filtered) customer list to CSV. */
  exportCustomers() {
    const list = this.filteredCustomers;
    if (!list.length) {
      this.toast.info('Nothing to export', 'There are no customers to export.');
      return;
    }
    const rows = list.map(c => ({
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      Orders: c.ordersCount,
      TotalSpent: c.totalSpent,
      Status: c.status,
      LastOrder: this.formatDate(c.lastOrder),
      MemberSince: this.formatDate(c.memberSince)
    }));
    downloadCsv(`customers-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    this.toast.success('Exported', `${rows.length} customers downloaded as CSV.`);
  }
}
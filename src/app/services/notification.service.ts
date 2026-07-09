import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.initSocket();
      this.fetchNotifications();
    }
  }

  private initSocket() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.socket?.emit('join-admin');
    });

    this.socket.on('new-notification', (notification: Notification) => {
      this.ngZone.run(() => {
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([notification, ...current]);
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      });
    });
  }

  fetchNotifications() {
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe({
      next: (res) => {
        if (res.success) {
          this.notificationsSubject.next(res.notifications);
          this.unreadCountSubject.next(res.unreadCount);
        }
      },
      error: (err) => console.error('Failed to fetch notifications', err)
    });
  }

  markAsRead(id: string) {
    this.http.put<any>(`${environment.apiUrl}/notifications/${id}/read`, {}).subscribe({
      next: (res) => {
        if (res.success) {
          const current = this.notificationsSubject.value;
          if (id === 'all') {
            current.forEach(n => n.isRead = true);
            this.unreadCountSubject.next(0);
          } else {
            const index = current.findIndex(n => n._id === id);
            if (index !== -1 && !current[index].isRead) {
              current[index].isRead = true;
              this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
            }
          }
          this.notificationsSubject.next([...current]);
        }
      },
      error: (err) => console.error('Failed to mark notification as read', err)
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

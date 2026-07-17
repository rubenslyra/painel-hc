import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/core/auth/auth.service';
import { NotificationBellComponent } from '@app/shared/ui/notification-bell.component';

interface NavItem { label: string; icon: string; route: string; exact?: boolean; }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink, RouterLinkActive, RouterOutlet, NotificationBellComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  nav: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: '/', exact: true },
    { label: 'Integrações', icon: 'sync_alt', route: '/integrations' },
    { label: 'Configurações', icon: 'tune', route: '/settings' }
  ];

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}

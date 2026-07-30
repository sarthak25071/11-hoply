import { Link, NavLink, useLocation } from 'react-router-dom';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'dark';
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button type={type} className={`button button-${variant} ${className}`.trim()} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'info' | 'warning' | 'danger' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <input className="input" {...props} />
    </label>
  );
}

export function TextArea({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <textarea className="input textarea" {...props} />
    </label>
  );
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <select className="input" {...props}>
        {children}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint?: string }) {
  return (
    <button className={`toggle ${checked ? 'toggle-on' : ''}`} type="button" onClick={() => onChange(!checked)}>
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className="toggle-switch" aria-hidden="true" />
    </button>
  );
}

export function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return <div className={`avatar ${className}`.trim()}>{initials}</div>;
}

export function StatTile({ label, value, accent = 'green' }: { label: string; value: string; accent?: 'green' | 'blue' | 'dark' }) {
  return (
    <div className={`stat-tile stat-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">Hoply</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyStateCard({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-card">
      <div className="empty-illustration" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Hoply</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/create-request', label: 'Create Trip' },
    { to: '/app/discovery', label: 'Discover' },
    { to: '/app/matches', label: 'Requests' },
    { to: '/app/chat/match-1', label: 'Messages' },
    { to: '/app/trips', label: 'Trips' },
    { to: '/app/notifications', label: 'Notifications' },
    { to: '/app/profile', label: 'Profile' },
    { to: '/app/settings', label: 'Settings' },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/app/dashboard" className="brand">
          <span className="brand-mark">H</span>
          <span>
            Hoply
            <small>Find your travel buddy</small>
          </span>
        </Link>

        <nav className="nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive || location.pathname.startsWith(item.to) ? 'nav-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <strong>Women-only matching</strong>
          <p>Show verified women profiles when safety-first filtering is enabled.</p>
          <Badge tone="success">Verified ready</Badge>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="search-pill">Search travellers, destinations, requests...</div>
          <div className="topbar-meta">
            <span className="dot" />
            <span>Rahul</span>
            <Avatar initials="RS" />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function AuthFrame({ children }: { children: ReactNode }) {
  return <div className="auth-shell">{children}</div>;
}

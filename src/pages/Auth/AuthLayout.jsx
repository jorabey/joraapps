import { OrbitMark } from '../../components/common/OrbitMark';
import './auth.css';

export function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true">
        <div className="auth__orbit auth__orbit--1" />
        <div className="auth__orbit auth__orbit--2" />
        <div className="auth__orbit auth__orbit--3" />
      </div>
      <div className="auth__card">
        <div className="auth__brand">
          <OrbitMark size={32} />
          <span className="auth__brand-name heading">Jora Apps</span>
        </div>
        {eyebrow && <span className="auth__eyebrow">{eyebrow}</span>}
        <h1 className="auth__title heading">{title}</h1>
        {subtitle && <p className="auth__subtitle">{subtitle}</p>}
        <div className="auth__body">{children}</div>
        {footer && <div className="auth__footer">{footer}</div>}
      </div>
    </div>
  );
}

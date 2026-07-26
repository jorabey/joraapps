import { NavLink } from 'react-router-dom';
import { IconGrid, IconGridFilled, IconUser, IconUserFilled } from '../common/icons';
import { useLang } from '../../context/LangContext';
import './navbar.css';

export function NavBar() {
  const { t } = useLang();
  return (
    <nav className="navbar">
      <NavLink to="/apps" className={({ isActive }) => `navbar__item ${isActive ? 'is-active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="navbar__icon">
              {isActive ? <IconGridFilled width={24} height={24} /> : <IconGrid width={24} height={24} />}
            </span>
            <span className="navbar__label">{t('nav_apps')}</span>
          </>
        )}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `navbar__item ${isActive ? 'is-active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="navbar__icon">
              {isActive ? <IconUserFilled width={24} height={24} /> : <IconUser width={24} height={24} />}
            </span>
            <span className="navbar__label">{t('nav_profile')}</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}

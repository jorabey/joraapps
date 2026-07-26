import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../context/ToastContext';
import {
  IconUser, IconDevice, IconLink, IconShield,
  IconGlobe, IconInfo, IconLogout, IconChevronRight,
} from '../../components/common/icons';
import './profile.css';

const Section = ({ items }) => (
  <div className="profile-section">
    {items.map((item, i) => (
      <button
        key={i}
        className={`profile-row ${item.danger ? 'profile-row--danger' : ''}`}
        onClick={item.onClick}
        disabled={item.disabled}
      >
        <span className={`profile-row__icon-wrap profile-row__icon-wrap--${item.color || 'default'}`}>
          {item.icon}
        </span>
        <span className="profile-row__label">{item.label}</span>
        {item.right ? (
          <span className="profile-row__right-label">{item.right}</span>
        ) : (
          <IconChevronRight width={16} height={16} className="profile-row__arrow" />
        )}
      </button>
    ))}
  </div>
);

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="profile-page">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <h1 className="profile-name heading">
          {user ? `${user.firstName} ${user.lastName}` : '—'}
        </h1>
        <p className="profile-username">@{user?.username || '—'}</p>
      </div>

      {/* Sections */}
      <div className="profile-sections">
        <Section
          items={[
            {
              icon: <IconUser width={18} height={18} />,
              label: t('profile_edit'),
              color: 'violet',
              onClick: () => navigate('/profile-edit'),
            },
            {
              icon: <IconDevice width={18} height={18} />,
              label: t('profile_sessions'),
              color: 'blue',
              onClick: () => navigate('/sessions'),
            },
            {
              icon: <IconLink width={18} height={18} />,
              label: t('profile_connections'),
              color: 'green',
              onClick: () => navigate('/app-connections'),
            },
          ]}
        />

        <Section
          items={[
            {
              icon: <IconShield width={18} height={18} />,
              label: t('profile_security'),
              color: 'orange',
              onClick: () => navigate('/security'),
            },
            {
              icon: <IconGlobe width={18} height={18} />,
              label: t('profile_language'),
              color: 'cyan',
              onClick: () => navigate('/language'),
              right: lang.toUpperCase(),
            },
          ]}
        />

        <Section
          items={[
            {
              icon: <IconInfo width={18} height={18} />,
              label: t('profile_about'),
              color: 'gray',
              onClick: () => navigate('/app-info'),
            },
          ]}
        />

        <div className="profile-section">
          <button className="profile-row profile-row--danger" onClick={onLogout}>
            <span className="profile-row__icon-wrap profile-row__icon-wrap--danger">
              <IconLogout width={18} height={18} />
            </span>
            <span className="profile-row__label">{t('profile_logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

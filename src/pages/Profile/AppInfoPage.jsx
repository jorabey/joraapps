import { PageHeader } from '../../components/layout/PageHeader';
import { OrbitMark } from '../../components/common/OrbitMark';
import { IconChevronRight } from '../../components/common/icons';
import { useLang } from '../../context/LangContext';
import './sub-page.css';
import './app-info.css';

const APP_VERSION = '1.0.0';
const APP_BUILD = '20260614';

export default function AppInfoPage() {
  const { t } = useLang();

  const links = [
    { label: t('appinfo_terms'), href: '/terms' },
    { label: t('appinfo_privacy'), href: '/privacy' },
    { label: t('appinfo_support'), href: '/support' },
  ];

  return (
    <div className="sub-page">
      <PageHeader title={t('profile_about')} />
      <div className="sub-page__body">

        <div className="appinfo-hero">
          <OrbitMark size={52} connected />
          <h2 className="heading" style={{ margin: '12px 0 4px', fontSize: 22 }}>Jora Apps</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
            Apps Center
          </p>
        </div>

        <div className="sub-section">
          <div className="sub-info-row">
            <span className="sub-info-label">{t('appinfo_version')}</span>
            <span className="sub-info-val mono">{APP_VERSION}</span>
          </div>
          <div className="sub-info-row" style={{ borderRadius: 0 }}>
            <span className="sub-info-label">{t('appinfo_build')}</span>
            <span className="sub-info-val mono">{APP_BUILD}</span>
          </div>
        </div>

        <div className="sub-section">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="appinfo-link">
              <span>{link.label}</span>
              <IconChevronRight width={16} height={16} style={{ color: 'var(--text-2)' }} />
            </a>
          ))}
        </div>

        <p className="appinfo-copy">
          © {new Date().getFullYear()} Jora Apps Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}

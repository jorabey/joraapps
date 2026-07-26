import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { OrbitLoader } from '../../components/common/OrbitMark';
import { IconDevice, IconClock } from '../../components/common/icons';
import { userApi } from '../../api/user';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import './sub-page.css';
import './sessions.css';

export default function SessionsPage() {
  const { t } = useLang();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    userApi.getSessions()
      .then(({ data }) => setSessions(data.sessions || []))
      .finally(() => setLoading(false));
  }, []);

  const revokeOthers = async () => {
    setRevoking(true);
    try {
      await userApi.terminateOtherSessions();
      setSessions((s) => s.filter((ss) => ss.isCurrentDevice));
      showToast(t('sessions_revoke_all'), 'success');
    } catch (err) {
      showToast(err?.message || 'Error', 'error');
    } finally {
      setRevoking(false);
    }
  };

  const hasOther = sessions.some((s) => !s.isCurrentDevice);

  return (
    <div className="sub-page">
      <PageHeader title={t('profile_sessions')} />
      <div className="sub-page__body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <OrbitLoader size={36} />
          </div>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--text-2)', textAlign: 'center', padding: '40px 0' }}>
            {t('sessions_empty')}
          </p>
        ) : (
          <>
            {sessions.map((s) => (
              <div key={s.id} className={`session-card ${s.isCurrentDevice ? 'session-card--current' : ''}`}>
                <div className="session-card__icon">
                  <IconDevice width={20} height={20} />
                </div>
                <div className="session-card__info">
                  <p className="session-card__device">
                    {s.deviceInfo?.browser?.split('/')[0] || 'Unknown Browser'}
                    {s.isCurrentDevice && (
                      <span className="session-card__badge">{t('sessions_current')}</span>
                    )}
                  </p>
                  <p className="session-card__meta">
                    {s.deviceInfo?.osName} · {s.deviceInfo?.ipAddress}
                  </p>
                  <p className="session-card__time">
                    <IconClock width={12} height={12} />
                    {s.lastActive ? new Date(s.lastActive).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            ))}

            {hasOther && (
              <Button
                variant="danger"
                fullWidth
                loading={revoking}
                onClick={revokeOthers}
              >
                {t('sessions_revoke_all')}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

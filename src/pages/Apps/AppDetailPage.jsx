import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { OrbitLoader } from '../../components/common/OrbitMark';
import { IconStar, IconCheck } from '../../components/common/icons';
import { ConnectModal, DisconnectModal, UnblockModal } from '../../components/modals/AppModals';
import { appsApi } from '../../api/apps';
import { connectionsApi } from '../../api/connections';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import '../../components/modals/modals.css';
import './app-detail.css';

export default function AppDetailPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLang();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState(null);
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 🚀 BARCHASI BITTA TEZKOR VA XAVFSIZ EFFECTGA BIRLASHTIRILDI
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // 1. Birinchi navbatda ilova ma'lumotlarini yuklaymiz
    appsApi.getAppDetails(username)
      .then(async ({ data }) => {
        if (!isMounted) return;
        
        const fetchedApp = data.app;
        setApp(fetchedApp);

        // 2. Agar backend ulanish holatini API ichida tayyor bergan bo'lsa, shuni olamiz
        const inlineStatus = data.connectionStatus || data.connection?.status;
        if (inlineStatus) {
          setConnStatus(inlineStatus);
          setLoading(false);
          return;
        }

        // 3. Agar inline status bo'lmasa va user tizimga kirgan bo'lsa, ulanishlarni tekshiramiz
        if (user && fetchedApp?._id) {
          try {
            const { docs } = await connectionsApi.getMyConnections({ limit: 50 });
            if (!isMounted) return;

            // Xavfsiz filtr: app.id yoki to'g'ridan-to'g'ri app ob'ektini tekshirish
            const userConnection = docs?.find(doc => {
              const connectedAppId = doc.app?.id || doc.app?._id || doc.app;
              return String(connectedAppId) === String(fetchedApp._id);
            });

            setConnStatus(userConnection?.status || null);
          } catch (err) {
            console.error("Error checking connections:", err);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading application details:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // Memory leak'ni oldini olish qalqoni
    };
  }, [username, user]);

  const isConnected = connStatus === 'connected';
  const isBlocked = connStatus === 'blocked';

  const handleConnect = async (perms) => {
    setActionLoading(true);
    try {
      await connectionsApi.connect(app._id, Object.keys(perms).filter(k => perms[k]));
      setConnStatus('connected');
      showToast(`${app.name} connected`, 'success');
    } catch (err) {
      showToast(err?.message || 'Error', 'error');
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    try {
      await connectionsApi.disconnect(app._id);
      setConnStatus(null);
      showToast(`${app.name} disconnected`, 'default');
    } catch (err) {
      showToast(err?.message || 'Error', 'error');
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleUnblock = async () => {
    setActionLoading(true);
    try {
      await connectionsApi.unblock(app._id);
      setConnStatus(null);
      showToast(`${app.name} Unblocked`, 'default');
    } catch {
      setConnStatus(null);
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  if (loading) return (
    <div className="app-detail">
      <PageHeader title="" />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <OrbitLoader />
      </div>
    </div>
  );

  if (!app) return (
    <div className="app-detail">
      <PageHeader title="404" />
      <div style={{ padding: 32, color: 'var(--text-2)', textAlign: 'center' }}>
        App not found
      </div>
    </div>
  );

  const rating = app.rating?.average?.toFixed(1) || '—';

  return (
    <div className="app-detail">
      <PageHeader title={app.name} />

      <div className="app-detail__hero">
        {app.iconUrl ? (
          <img src={app.iconUrl} alt={app.name} className="app-detail__icon" />
        ) : (
          <div className="app-detail__icon app-detail__icon--placeholder">
            {app.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="app-detail__hero-info">
          <h1 className="app-detail__name heading">{app.name}</h1>
          <div className="app-detail__meta">
            <IconStar width={14} height={14} style={{ color: 'var(--warn)' }} />
            <span>{rating}</span>
            <span className="app-detail__sep">·</span>
            <span>{app.stats?.mau?.toLocaleString() || 0} MAU</span>
            {app.isVerified && (
              <>
                <span className="app-detail__sep">·</span>
                <span className="app-detail__verified">
                  <IconCheck width={12} height={12} />
                  Verified
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {user ? (

      <div className="app-detail__actions">
        {isBlocked ? (
          <Button
            variant="secondary"
            fullWidth
            loading={actionLoading}
            onClick={() => setModal('unblock')}
          >
            {t('unblock')}
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/run/${app.username}`)}
            >
              {t('open')}
            </Button>
            <Button
              variant={isConnected ? 'ghost' : 'secondary'}
              fullWidth
              loading={actionLoading}
              onClick={() => setModal(isConnected ? 'disconnect' : 'connect')}
            >
              {isConnected ? t('disconnect') : t('connect')}
            </Button>
          </>
        )}
      </div>
):(
<div className="app-detail__actions">
               <Button
              variant="primary"
              fullWidth="true"
              onClick={() => navigate(`/run/${app.username}`)}
            >
              {t('login_title')}
            </Button>
             </div>
)}
      <section className="app-detail__desc">
        <p>{app.description}</p>
      </section>

      <ConnectModal open={modal === 'connect'} app={app} onClose={() => setModal(null)} onConfirm={handleConnect} />
      <DisconnectModal open={modal === 'disconnect'} app={app} onClose={() => setModal(null)} onConfirm={handleDisconnect} />
      <UnblockModal open={modal === 'unblock'} app={app} onClose={() => setModal(null)} onConfirm={handleUnblock} />
    </div>
  );
}
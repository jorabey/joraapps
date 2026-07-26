import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContextTrigger } from '../../hooks/useContextTrigger';
import { ContextMenu } from '../context-menu/ContextMenu';
import {
  ConnectModal, DisconnectModal, BlockModal, UnblockModal, ReportModal
} from '../modals/AppModals';
import { connectionsApi } from '../../api/connections';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import {
  IconLink, IconUnlink, IconShieldOff, IconFlag, IconInfo,
  IconExternal, IconStar
} from '../common/icons';
import './app-card.css';

export function AppCard({ app, connectionStatus: initialStatus, onStatusChange }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();

  // connectionStatus: null | 'connected' | 'blocked' | 'disconnected'
  const [connStatus, setConnStatus] = useState(initialStatus || null);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [ctxOpen, setCtxOpen] = useState(false);
  const [modal, setModal] = useState(null); // connect | disconnect | block | unblock | report

  const isConnected = connStatus === 'connected';
  const isBlocked = connStatus === 'blocked';

  const openApp = useCallback(() => {
    if (isBlocked) {
      setModal('unblock');
      return;
    }
    navigate(`/run/${app.username}`);
  }, [isBlocked, navigate, app.username]);

  const onTap = useCallback(() => openApp(), [openApp]);

  const onTrigger = useCallback(({ x, y }) => {
    setCtxPos({ x, y });
    setCtxOpen(true);
  }, []);

  const triggers = useContextTrigger({ onTrigger, onTap });

  /* ---- Context menu items ---- */
  const ctxItems = isBlocked
    ? [
        {
          label: t('unblock'),
          icon: <IconLink width={17} height={17} />,
          onClick: () => setModal('unblock'),
        },
        { divider: true },
        {
          label: t('about_app'),
          icon: <IconInfo width={17} height={17} />,
          onClick: () => navigate(`/${app.username}`),
        },
      ]
    : [
        {
          label: t('open'),
          icon: <IconExternal width={17} height={17} />,
          onClick: openApp,
        },
        {
          label: isConnected ? t('disconnect') : t('connect'),
          icon: isConnected
            ? <IconUnlink width={17} height={17} />
            : <IconLink width={17} height={17} />,
          onClick: () => setModal(isConnected ? 'disconnect' : 'connect'),
        },
        { divider: true },
        {
          label: t('block'),
          icon: <IconShieldOff width={17} height={17} />,
          variant: 'warn',
          onClick: () => setModal('block'),
        },
        {
          label: t('report'),
          icon: <IconFlag width={17} height={17} />,
          variant: 'danger',
          onClick: () => setModal('report'),
        },
        { divider: true },
        {
          label: t('about_app'),
          icon: <IconInfo width={17} height={17} />,
          onClick: () => navigate(`/${app.username}`),
        },
      ];

  /* ---- Actions ---- */
  const updateStatus = (s) => {
    setConnStatus(s);
    onStatusChange?.(app._id, s);
  };

  const handleConnect = async (perms) => {
    if (!user) { navigate('/login'); return; }
    try {
      await connectionsApi.connect(app._id, Object.keys(perms).filter((k) => perms[k]));
      updateStatus('connected');
      showToast(`${app.name} ${t('connected_badge').toLowerCase()}`, 'success');
    } catch (err) {
      showToast(err?.message || 'Error', 'error');
    }
    setModal(null);
  };

  const handleDisconnect = async () => {
    try {
      await connectionsApi.disconnect(app._id);
      updateStatus('disconnected');
      showToast(`${app.name} disconnected`, 'default');
    } catch (err) {
      showToast(err?.message || 'Xatolik', 'error');
    }
    setModal(null);
  };

  const handleBlock = async () => {
    try {
      await connectionsApi.block(app._id);
      updateStatus('blocked');
      showToast(`${app.name} blocked`, 'warn');
    } catch {
      // Optimistic block even if server endpoint is not ready
      updateStatus('blocked');
      showToast(`${app.name} blocked`, 'warn');
    }
    setModal(null);
  };

  const handleUnblock = async () => {
    try {
      await connectionsApi.unblock(app._id);
      updateStatus(null);
      showToast(`${app.name} unblocked`, 'default');
    } catch {
      updateStatus(null);
      showToast(`${app.name} unblocked`, 'default');
    }
    setModal(null);
  };

  const handleReport = async (reason, desc) => {
    try {
      await connectionsApi.report(app._id, reason, desc);
    } catch { /* optimistic */ }
    showToast(t('report_sent'), 'default');
    setModal(null);
  };

  const rating = app.rating?.average?.toFixed(1) || '—';

  return (
    <>
      <article
        className={`app-card ${isBlocked ? 'app-card--blocked' : ''}`}
        data-allow-context-menu
        {...triggers}
        aria-label={app.name}
      >
        <div className="app-card__icon-wrap">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt="" className="app-card__icon" loading="lazy" />
          ) : (
            <div className="app-card__icon app-card__icon--placeholder">
              {app.name?.[0]?.toUpperCase()}
            </div>
          )}
          {isConnected && <span className="app-card__dot app-card__dot--connected" />}
          {isBlocked && <span className="app-card__dot app-card__dot--blocked" />}
        </div>
        <div className="app-card__info">
          <p className="app-card__name">{app.name}</p>
          <div className="app-card__meta">
            <IconStar width={11} height={11} style={{ color: 'var(--warn)', flexShrink: 0 }} />
            <span>{rating}</span>
            {app.isVerified && <span className="app-card__verified">✓</span>}
          </div>
        </div>
      </article>

      <ContextMenu
        open={ctxOpen}
        pos={ctxPos}
        items={ctxItems}
        onClose={() => setCtxOpen(false)}
      />

      <ConnectModal
        open={modal === 'connect'}
        app={app}
        existingPerms={null}
        onClose={() => setModal(null)}
        onConfirm={handleConnect}
      />
      <DisconnectModal
        open={modal === 'disconnect'}
        app={app}
        onClose={() => setModal(null)}
        onConfirm={handleDisconnect}
      />
      <BlockModal
        open={modal === 'block'}
        app={app}
        onClose={() => setModal(null)}
        onConfirm={handleBlock}
      />
      <UnblockModal
        open={modal === 'unblock'}
        app={app}
        onClose={() => setModal(null)}
        onConfirm={handleUnblock}
      />
      <ReportModal
        open={modal === 'report'}
        app={app}
        onClose={() => setModal(null)}
        onConfirm={handleReport}
      />
    </>
  );
}

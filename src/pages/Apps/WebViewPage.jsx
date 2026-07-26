import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appsApi } from '../../api/apps';
import { connectionsApi } from '../../api/connections';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { IconChevronLeft, IconRefresh } from '../../components/common/icons';
import { OrbitLoader } from '../../components/common/OrbitMark';
import { JoraAppsHostBridge } from '../../utils/JoraAppsHostBridge';
import { HostDialog } from '../../components/webview/HostDialog';
import './webview.css';

export default function WebViewPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeReady, setIframeReady] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const iframeRef = useRef(null);
  const bridgeRef = useRef(null);

  useEffect(() => {
    appsApi.getAppDetails(username)
      .then(({ data }) => setApp(data.app))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [username, navigate]);

  /* ----------------------------------------------------------------
     Host-side handler for app-level requests coming from @nexa/sdk
     running inside the mini-app. Each case talks to the real API.
     ---------------------------------------------------------------- */
  const handleSdkRequest = useCallback(async ({ type, payload }) => {
    if (!app) return { ok: false, error: 'App not ready' };

    switch (type) {
      case 'requestUserData': {
        // The SDK never talks to the Bridge API directly (it has no
        // secret). It only asks the host "does the user allow these
        // scopes" — actual user-data delivery to the app's *backend*
        // happens server-to-server via the signed Bridge API using
        // the developer's server-side SDK. Here we just report the
        // current connection + granted scopes so the in-app UI can
        // adapt (e.g. hide "connect" button if already connected).
        try {
          const res = await connectionsApi.getMyConnections({ limit: 50 });
          const conn = (res.docs || []).find((c) => c.app.id === app._id);
          if (!conn) return { ok: true, connected: false, scopes: [] };
          const scopes = Object.keys(conn.permissions || {}).filter((k) => conn.permissions[k]);
          return { ok: true, connected: true, scopes, userId: user?._id };
        } catch (err) {
          return { ok: false, error: err?.message || 'Failed to read connection' };
        }
      }

      case 'requestConnect': {
        try {
          await connectionsApi.connect(app._id, payload?.scopes || []);
          showToast(`${app.name} connected`, 'success');
          return { ok: true };
        } catch (err) {
          return { ok: false, error: err?.message || 'Connect failed' };
        }
      }

      case 'requestDisconnect': {
        try {
          await connectionsApi.disconnect(app._id);
          showToast(`${app.name} disconnected`, 'default');
          return { ok: true };
        } catch (err) {
          return { ok: false, error: err?.message || 'Disconnect failed' };
        }
      }

      case 'close': {
        navigate(-1);
        return { ok: true };
      }

      case 'hapticFeedback': {
        if (navigator.vibrate) {
          const ms = payload?.style === 'heavy' ? 1000 : payload?.style === 'light' ? 15 : 30;
          navigator.vibrate(ms);
        }
        return { ok: true };
      }

      case 'setTitle': {
        // Cosmetic only — we keep our own header showing the app name,
        // but apps may want to know we acknowledged it.
        return { ok: true };
      }

      case 'openExternalConfirm': {
        // The SDK asks permission before navigating somewhere outside
        // the app — we show a host confirm dialog rather than letting
        // the iframe redirect the top-level page directly.
        return new Promise((resolve) => {
          setDialog({
            kind: 'confirm',
            payload: {
              message: payload?.url
                ? `Open this link outside Jora Apps?\n${payload.url}`
                : 'Open this link outside Jora Apps?',
            },
            resolve: (result) => {
              setDialog(null);
              if (result.ok && payload?.url) {
                // Explicit, user-approved navigation only — never automatic.
                window.open(payload.url, '_blank', 'noopener,noreferrer');
              }
              resolve(result);
            },
          });
        });
      }

      default:
        return { ok: false, error: 'Unsupported request type' };
    }
  }, [app, user, navigate, showToast]);

  /* ----------------------------------------------------------------
     UI requests (alert/confirm/select/prompt) — always rendered with
     our own HostDialog, never the browser's native dialogs.
     ---------------------------------------------------------------- */
  const handleSdkUI = useCallback((req) => {
    setDialog({
      ...req,
      resolve: (result) => {
        setDialog(null);
        req.resolve(result);
      },
    });
  }, []);

  /* ----------------------------------------------------------------
     Wire up the bridge once the iframe has loaded and we know the
     app's exact origin (derived from appUrl, never '*').
     ---------------------------------------------------------------- */
  const onIframeLoad = useCallback(() => {
    setIframeReady(true);
    if (!app?.appUrl || !iframeRef.current) return;

    let targetOrigin;
    try {
      targetOrigin = new URL(app.appUrl).origin;
    } catch {
      return;
    }

    bridgeRef.current?.detach();
    const bridge = new JoraAppsHostBridge({
      iframeWindow: iframeRef.current.contentWindow,
      targetOrigin,
      onRequest: handleSdkRequest,
      onUI: handleSdkUI,
    });
    bridge.attach();
    bridgeRef.current = bridge;
  }, [app, handleSdkRequest, handleSdkUI]);

  useEffect(() => () => bridgeRef.current?.detach(), []);

  // 🔒 SECURITY LAYER: Tizim funksiyalarini qulflash
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    let meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleBack = () => {
    navigate('/apps', { replace: true }); 
  };

  const reload = () => {
    if (iframeRef.current) {
      setIframeReady(false);
      bridgeRef.current?.detach();
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="webview">
      <div 
          className={`webview__island ${isExpanded ? 'webview__island--expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Orqaga qaytish tugmasi (Faqat kengayganda chiqadi) */}
          <button 
            className="webview__btn webview__btn--back" 
            onClick={(e) => { e.stopPropagation(); handleBack(); }} 
            aria-label="Back"
          >
            <IconChevronLeft width={18} height={18} />
          </button>

          {/* Markaziy qism: Rasm va Nom */}
          <div className="webview__title-row">
            {app?.iconUrl && (
              <img src={app.iconUrl} alt="" className="webview__app-icon" />
            )}
            <span className="webview__app-name">{app?.name || username}</span>
          </div>

          {/* Refresh tugmasi (Faqat kengayganda chiqadi) */}
          <button 
            className="webview__btn webview__btn--refresh" 
            onClick={(e) => { e.stopPropagation(); reload(); }} 
            aria-label="Reload"
          >
            <IconRefresh width={16} height={16} />
          </button>
        </div>

      {!iframeReady && !loading && <div className="webview__progress" />}

      {loading ? (
        <div className="webview__loader">
          <OrbitLoader size={44} />
        </div>
      ) : app ? (
        <iframe
          ref={iframeRef}
          src={app.appUrl}
          className="webview__iframe"
          title={app.name}
          onLoad={onIframeLoad}
          /* Hardened sandbox: scripts + forms only. No allow-popups, no
             allow-modals, no allow-top-navigation — this is what actually
             stops window.open()/native alert()/top-frame hijack attempts
             at the browser level, regardless of what the mini-app's code
             tries to do. allow-same-origin is required so the SDK can
             postMessage with the host (postMessage works across origins
             regardless, but same-origin is needed for some SDK internals
             like reading its own location for openExternalConfirm). */
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="geolocation; camera; microphone; payment"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}

      <HostDialog dialog={dialog} />
    </div>
  );
}

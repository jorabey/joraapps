import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { OrbitLoader } from '../../components/common/OrbitMark';
import { IconStar, IconChevronRight } from '../../components/common/icons';
import { ConnectModal, DisconnectModal, BlockModal } from '../../components/modals/AppModals';
import { connectionsApi } from '../../api/connections';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import '../../components/modals/modals.css';
import './sub-page.css';
import './app-connections.css';

export default function AppConnectionsPage() {
  const { t } = useLang();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    connectionsApi.getMyConnections({ limit: 48 })
      .then(({ docs }) =>{
        const filteredDocs = docs?.filter((doc)=>{
          return doc?.status == "connected"
        })
        setConnections(filteredDocs || [])
      })
      .finally(() => setLoading(false));
  }, []);


  const handleDisconnect = async () => {
    try {
      await connectionsApi.disconnect(selected.app.id);
      setConnections((c) => c.filter((x) => x.app.id !== selected.app.id));
      showToast(`${selected.app.name} disconnected`, 'default');
    } catch (err) {
      showToast(err?.message || 'Error', 'error');
    }
    setModal(null);
    setSelected(null);
  };

  const handleBlock = async () => {
    try {
      await connectionsApi.block(selected.app.id);
      setConnections((c) => c.filter((x) => x.app.id !== selected.app.id));
      showToast(`${selected.app.name} blocked`, 'warn');
    } catch {
      setConnections((c) => c.filter((x) => x.app.id !== selected.app.id));
    }
    setModal(null);
    setSelected(null);
  };

  const openMenu = (conn, e) => {
    e.stopPropagation();
    setSelected(conn);
    setModal('manage');
  };

  return (
    <div className="sub-page">
      <PageHeader title={t('profile_connections')} />
      <div className="sub-page__body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <OrbitLoader size={36} />
          </div>
        ) : connections.length === 0 ? (
          <p style={{ color: 'var(--text-2)', textAlign: 'center', padding: '40px 0' }}>
            {t('appcon_empty')}
          </p>
        ) : (
          <div className="sub-section">
            {connections.map((conn) => {
              const app = conn.app;
              return (
                <div
                  key={conn.connectionId}
                  className="conn-row"
                  onClick={() => navigate(`/${app.username}`)}
                >
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt="" className="conn-row__icon" />
                  ) : (
                    <div className="conn-row__icon conn-row__icon--placeholder">
                      {app.name?.[0]}
                    </div>
                  )}
                  <div className="conn-row__info">
                    <p className="conn-row__name">{app.name}</p>
                    <p className="conn-row__perms">
                      {Object.keys(conn.permissions || {})
                        .filter((k) => conn.permissions[k])
                        .join(', ')}
                    </p>
                  </div>
                  <button
                    className="conn-row__manage"
                    onClick={(e) => openMenu(conn, e)}
                  >
                    {t('appcon_manage')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manage sheet */}
      {selected && modal === 'manage' && (
        <div
          className="manage-overlay"
          onMouseDown={() => { setModal(null); setSelected(null); }}
        >
          <div className="manage-menu" onMouseDown={(e) => e.stopPropagation()}>
            <div className="manage-menu__grip" />
            <div className="manage-menu__header">
              {selected.app.iconUrl && (
                <img src={selected.app.iconUrl} alt="" className="manage-menu__icon" />
              )}
              <span className="manage-menu__name">{selected.app.name}</span>
            </div>
            <button className="manage-menu__item" onClick={() => setModal('disconnect')}>
              {t('disconnect')}
            </button>
            <button className="manage-menu__item manage-menu__item--danger" onClick={() => setModal('block')}>
              {t('block')}
            </button>
            <button className="manage-menu__item" onClick={() => { setModal(null); setSelected(null); }}>
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <DisconnectModal
        open={modal === 'disconnect'}
        app={selected?.app.id}
        onClose={() => { setModal(null); setSelected(null); }}
        onConfirm={handleDisconnect}
      />
      <BlockModal
        open={modal === 'block'}
        app={selected?.app.id}
        onClose={() => { setModal(null); setSelected(null); }}
        onConfirm={handleBlock}
      />
    </div>
  );
}

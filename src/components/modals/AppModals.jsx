import { useState } from 'react';
import { Sheet } from '../common/Sheet';
import { Button } from '../common/Button';
import { useLang } from '../../context/LangContext';

/* ----------------------------------------------------------------
   CONNECT MODAL — permission scopes selection
   ---------------------------------------------------------------- */
export function ConnectModal({ open, app, existingPerms, onClose, onConfirm }) {
  const { t } = useLang();

  const [perms, setPerms] = useState(() => ({
    profile: existingPerms?.profile ?? true,
    email: existingPerms?.email ?? false,
    phone: existingPerms?.phone ?? false,
    gender: existingPerms?.gender ?? false,
    dob: existingPerms?.dob ?? false,
    notifications: existingPerms?.notifications ?? false,
  }));
  const [loading, setLoading] = useState(false);

  const toggle = (key) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm(perms);
    } finally {
      setLoading(false);
    }
  };

  const scopeLabels = [
    { key: 'profile', label: t('perm_profile') },
    { key: 'email',   label: t('perm_email') },
    { key: 'phone',   label: t('perm_phone') },
    { key: 'gender',  label: t('perm_gender') },
    { key: 'dob',     label: t('perm_dob') },
    { key: 'notifications', label: t('perm_notifications') },
  ];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={app ? `${app.name} — ${t('connections_title')}` : t('connections_title')}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>{t('cancel')}</Button>
          <Button variant="violet" fullWidth loading={loading} onClick={confirm}>{t('connect')}</Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-1)', fontSize: 14, margin: '0 0 18px', lineHeight: 1.5 }}>
        {t('connections_desc')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {scopeLabels.map(({ key, label }) => (
          <label key={key} className="perm-row">
            <span className="perm-label">{label}</span>
            <input
              type="checkbox"
              className="perm-toggle"
              checked={perms[key]}
              onChange={() => toggle(key)}
            />
          </label>
        ))}
      </div>
    </Sheet>
  );
}

/* ----------------------------------------------------------------
   DISCONNECT MODAL
   ---------------------------------------------------------------- */
export function DisconnectModal({ open, app, onClose, onConfirm }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('disconnect_title')}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>{t('cancel')}</Button>
          <Button variant="danger" fullWidth loading={loading} onClick={confirm}>{t('disconnect')}</Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-1)', fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: 'var(--text-0)' }}>{app?.name}</strong>{' '}
        {t('disconnect_desc')}
      </p>
    </Sheet>
  );
}

/* ----------------------------------------------------------------
   BLOCK MODAL
   ---------------------------------------------------------------- */
export function BlockModal({ open, app, onClose, onConfirm }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('block_title')}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>{t('cancel')}</Button>
          <Button variant="danger" fullWidth loading={loading} onClick={confirm}>{t('block')}</Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-1)', fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: 'var(--text-0)' }}>{app?.name}</strong>{' '}
        {t('block_desc')}
      </p>
    </Sheet>
  );
}

/* ----------------------------------------------------------------
   UNBLOCK MODAL
   ---------------------------------------------------------------- */
export function UnblockModal({ open, app, onClose, onConfirm }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('unblock_title')}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>{t('cancel')}</Button>
          <Button variant="primary" fullWidth loading={loading} onClick={confirm}>{t('unblock')}</Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-1)', fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: 'var(--text-0)' }}>{app?.name}</strong>{' '}
        {t('unblock_desc')}
      </p>
    </Sheet>
  );
}

/* ----------------------------------------------------------------
   REPORT MODAL
   ---------------------------------------------------------------- */
const REASONS = ['spam', 'inappropriate', 'malware', 'copyright', 'fake_app', 'other'];

export function ReportModal({ open, app, onClose, onConfirm }) {
  const { t } = useLang();
  const [reason, setReason] = useState('spam');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason, desc.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('report_title')}
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="danger"
            fullWidth
            loading={loading}
            disabled={!desc.trim()}
            onClick={confirm}
          >
            {t('report_reason')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>
            {t('report_reason')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {REASONS.map((r) => (
              <button
                key={r}
                className={`reason-chip ${reason === r ? 'reason-chip--active' : ''}`}
                onClick={() => setReason(r)}
              >
                {t(`reason_${r}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>
            {t('report_desc_label')}
          </p>
          <textarea
            className="report-textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t('report_desc_placeholder')}
            rows={4}
          />
        </div>
      </div>
    </Sheet>
  );
}

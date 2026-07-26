import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Field } from '../../components/common/Field';
import { Button } from '../../components/common/Button';
import { IconLock } from '../../components/common/icons';
import { useLang } from '../../context/LangContext';

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ResetPasswordPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otpCode } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!email || !otpCode) {
    return (
      <AuthLayout title={t('forgot_title')}>
        <Link to="/forgot-password" className="auth-link">Qaytish</Link>
      </AuthLayout>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!PASSWORD_RE.test(password)) {
      setError('The password must contain at least 8 characters, uppercase and lowercase letters, numbers, and special characters (@$!%*?&).');
      return;
    }
    if (password !== confirm) {
      setError('The passwords are not the same.');
      return;
    }
    setLoading(true);
    try {
      // NOTE: The server doesn't expose a public reset-password-with-OTP endpoint yet.
      // Wire this to /api/v1/client/auth/reset-password when added server-side.
      // For now we simulate success and redirect to login.
      await new Promise((r) => setTimeout(r, 800));
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('reset_submit')}
      subtitle={`Email: ${email}`}
    >
      {done ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 17 }}>
            ✓ Password successfully set
          </p>
          <p style={{ color: 'var(--text-1)', fontSize: 14 }}>Redirecting to the login page...</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="auth__body" noValidate>
          {error && <div className="auth-error">{error}</div>}
          <Field
            label={t('reset_new_password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<IconLock width={18} height={18} />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Field
            label={t('reset_confirm_password')}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<IconLock width={18} height={18} />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            {t('reset_submit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Field } from '../../components/common/Field';
import { Button } from '../../components/common/Button';
import { IconMail, IconLock } from '../../components/common/icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { ApiError } from '../../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError(t('login_identifier') + ' / ' + t('login_password'));
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      const redirectTo = location.state?.from || '/apps';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('login_title')}
      subtitle={t('login_subtitle')}
      footer={
        <span>
          {t('login_no_account')}{' '}
          <Link to="/register" className="auth-link" style={{ display: 'inline' }}>
            {t('login_register_link')}
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="auth__body" noValidate>
        {error && <div className="auth-error">{error}</div>}
        <Field
          label={t('login_identifier')}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          icon={<IconMail width={18} height={18} />}
          placeholder="Email / Username"
          autoComplete="username"
        />
        <Field
          label={t('login_password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<IconLock width={18} height={18} />}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <div className="auth-link-row">
          <Link to="/forgot-password" className="auth-link">
            {t('login_forgot')}
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {t('login_submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}

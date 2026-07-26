import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { ApiError } from '../../api/client';

export default function VerifyPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const state = location.state || {};
  const email = state.payload?.email || state.email || '';
  const mode = state.mode || 'register'; // register | forgot

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) { navigate('/register', { replace: true }); return; }
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (!otp[i] && i > 0) {
        inputsRef.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length) {
      const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(next);
      inputsRef.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const otpCode = otp.join('');

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (otpCode.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ ...state.payload, otpCode });
        navigate('/apps', { replace: true });
      } else {
        // forgot-password flow — just navigate with code
        navigate('/reset-password', { state: { email, otpCode }, replace: true });
      }
    } catch (err) {
      setAttemptsLeft((a) => a - 1);
      setError(err instanceof ApiError ? err.message : 'An error occurred.');
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (countdown > 0 || attemptsLeft <= 0) return;
    setError('');
    try {
      await authApi.sendOtp(email);
      setCountdown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An error occurred.');
    }
  };

  return (
    <AuthLayout
      eyebrow={mode === 'register' ? t('register_title') : t('forgot_title')}
      title={t('verify_title')}
      subtitle={`${t('verify_subtitle')} ${email}`}
      footer={
        <Link to="/login" className="auth-link" style={{ display: 'inline' }}>
          {t('forgot_back')}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="auth__body" noValidate>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-otp" onPaste={handlePaste}>
          {otp.map((val, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {attemptsLeft < 3 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--warn)', margin: 0 }}>
            {attemptsLeft} {t('verify_attempts_left')}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading} disabled={otpCode.length < 6}>
          {t('verify_submit')}
        </Button>

        <div className="auth-resend">
          {countdown > 0 ? (
            <span>{countdown} {t('verify_resend_in')}</span>
          ) : (
            <button type="button" onClick={resend} disabled={attemptsLeft <= 0}>
              {t('verify_resend')}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

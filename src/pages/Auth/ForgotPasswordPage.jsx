import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Field } from '../../components/common/Field';
import { Button } from '../../components/common/Button';
import { IconMail } from '../../components/common/icons';
import { authApi } from '../../api/auth';
import { useLang } from '../../context/LangContext';
import { ApiError } from '../../api/client';

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  // Oqim bosqichini boshqarish: 1 - Email kiritish, 2 - OTP + Yangi Parol kiritish
  const [step, setStep] = useState(1); 
  
  // Ma'lumotlar holati
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  
  // Tizim holatlari
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputsRef = useRef([]);

  // Resend OTP Taymeri
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // OTP Kiritish klaviatura mantiqlari
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length) {
      const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(next);
      inputsRef.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const otpCode = otp.join('');

  // 1-BOSQICH SUBMIT: Emailga OTP jo'natish
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Iltimos, email manzilingizni to‘g‘ri kiriting.');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendOtp(email.trim().toLowerCase());
      setStep(2); // Ma'lumot to'g'ri bo'lsa, 2-bosqichga o'tamiz
      setCountdown(60); // 1 daqiqalik cheklov qo'yamiz
      setTimeout(() => inputsRef.current[0]?.focus(), 100); // Birinchi OTP maydoniga fokus beramiz
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  // 2-BOSQICH SUBMIT: OTP kod va Yangi parolni yuborib tiklash
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otpCode.length < 6) {
      setError('Iltimos, 6 xonali tasdiqlash kodini to‘liq kiriting.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Yangi parol kamida 8 ta belgidan iborat bo‘lishi shart.');
      return;
    }

    setLoading(true);
    try {
      // Backend routinga yozgan yangi tuzatilgan endpointimizga ketadi
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        otpCode,
        newPassword: newPassword.trim()
      });

      setSuccessMessage('Parolingiz muvaffaqiyatli yangilandi! Login sahifasiga yo‘naltirilmoqdasiz...');
      
      // 2 soniyadan keyin login sahifasiga otadi
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);

    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi.');
      setOtp(['', '', '', '', '', '']); // Xato bo'lsa OTP maydonini tozalaymiz
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // OTP Kodni qayta yuborish funksiyasi (Oynadan chiqmasdan)
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      await authApi.sendOtp(email.trim().toLowerCase());
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kodni qayta yuborishda xatolik.');
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? t('forgot_title') : 'Parolni yangilash'}
      subtitle={step === 1 ? t('forgot_subtitle') : `${email} manziliga yuborilgan kodni va yangi parolingizni kiriting.`}
      footer={
        <Link to="/login" className="auth-link" style={{ display: 'inline' }}>
          {t('forgot_back')}
        </Link>
      }
    >
      {/* 1-BOSQICH FORMASI: FAQAT EMAIL */}
      {step === 1 && (
        <form onSubmit={handleSendEmail} className="auth__body" noValidate>
          {error && <div className="auth-error">{error}</div>}
          
          <Field
            label={t('register_email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<IconMail width={18} height={18} />}
            placeholder="Email"
            autoComplete="email"
          />
          
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Kodni yuborish
          </Button>
        </form>
      )}

      {/* 2-BOSQICH FORMASI: OTP + YANGI PAROL */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="auth__body" noValidate>
          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success" style={{ color: 'var(--success)', backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>{successMessage}</div>}

          {/* Splay-OTP Inputs Bloki */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>Tasdiqlash kodi</label>
            <div className="auth-otp" onPaste={handleOtpPaste}>
              {otp.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>

          {/* Yangi parol kiritish maydoni */}
          <Field
            label="Yangi xavfsiz parol"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            loading={loading} 
            disabled={otpCode.length < 6 || newPassword.length < 8 || !!successMessage}
          >
            Parolni saqlash va kirish
          </Button>

          {/* Qayta yuborish tugmasi va Taymer */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            {countdown > 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Kodni qayta yuborish: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{countdown}s</span>
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', decoration: 'underline' }}
              >
                Kodni qayta yuborish
              </button>
            )}
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
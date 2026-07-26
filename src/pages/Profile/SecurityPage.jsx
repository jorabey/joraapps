import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Field } from '../../components/common/Field';
import { Button } from '../../components/common/Button';
import { IconLock } from '../../components/common/icons';
import { userApi } from '../../api/user';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import { ApiError } from '../../api/client';
import './sub-page.css';

export default function SecurityPage() {
  const { t } = useLang();
  const { showToast } = useToast();

  // --- 1. APP LOCK STATE (PIN TIZIMI) ---
  const [isPinActive, setIsPinActive] = useState(() => !!localStorage.getItem('secure_pin'));
  const [pinMode, setPinMode] = useState('none'); // 'setup', 'disable', 'none'
  const [pinLength, setPinLength] = useState(4); // 4 yoki 6 talik raqam
  const [pinValue, setPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(() => Number(localStorage.getItem('pin_failed_attempts')) || 0);

  // --- 2. ULTRA-SECURE MODE (XAVFSIZ REJIM) ---
  const [secureMode, setSecureMode] = useState(() => localStorage.getItem('ultra_secure_mode') === 'true');

  // --- 3. PAROL O'ZGARTIRISH (API) ---
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');

  // ========================================================
  // MANTIQ 1: APP LOCK (PIN) SOZLAMALARI
  // ========================================================
  const handleActivatePin = () => {
    if (!pinValue || pinValue.length !== pinLength) {
      showToast(`Please enter a PIN of ${pinLength} digits.`, 'error');
      return;
    }
    if (pinValue !== confirmPinValue) {
      showToast("PIN codes did not match.", 'error');
      return;
    }
    localStorage.setItem('secure_pin', pinValue);
    localStorage.setItem('secure_pin_length', pinLength.toString());
    setIsPinActive(true);
    setPinMode('none');
    setPinValue(''); setConfirmPinValue('');
    showToast("App PIN activated", 'success');
  };

  const handleDisablePin = () => {
    const savedPin = localStorage.getItem('secure_pin');
    if (pinValue === savedPin) {
      localStorage.removeItem('secure_pin');
      localStorage.removeItem('secure_pin_length');
      localStorage.removeItem('pin_failed_attempts');
      setIsPinActive(false);
      setPinMode('none');
      setPinValue('');
      showToast("PIN code successfully deleted", 'warn');
    } else {
      showToast("The old PIN code is incorrect!", 'error');
    }
  };

  // ========================================================
  // MANTIQ 2: ULTRA XAVFSIZ REJIM AKTIVATORI
  // ========================================================
  const toggleSecureMode = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const confirm = window.confirm(
        "NOTE! When 'Safe Mode' is enabled, the app will stop leaking any information." +
        "DevTools will be blocked, caches will be cleared every 1 minute, and any copying will be prohibited. Shall we continue?"
      );
      if (!confirm) return;
    }
    
    setSecureMode(checked);
    localStorage.setItem('ultra_secure_mode', checked ? 'true' : 'false');
    showToast(checked ? "Safe Mode 🚀 ACTIVE" : "Safe Mode disabled", checked ? 'warn' : 'info');
    
    // Sahifani qayta yuklaymiz, shunda global render skriptlar (App.js) darhol kuchga kiradi
    setTimeout(() => window.location.reload(), 800);
  };

  // Real vaqtda ushbu sahifaning o'zida ham DevTools va Context rejimlarini ushlab turish
  useEffect(() => {
    if (!secureMode) return;

    // A. Sichqoncha o'ng tugmasi va Nusxalashni hardware darajasida bloklash
    const preventActions = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('copy', preventActions);
    document.addEventListener('cut', preventActions);
    document.addEventListener('paste', preventActions);
    document.addEventListener('selectstart', preventActions);
    document.addEventListener('dragstart', preventActions);

    // B. F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+S larni bloklash
    const preventKeys = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'U') || 
        (e.ctrlKey && e.key === 'S')
      ) {
        e.preventDefault();
        showToast("This action is blocked in safe mode!", "error");
      }
    };
    window.addEventListener('keydown', preventKeys);

    // C. Har 3 soniyada Console va Application izlarini tozalash
    const consoleInterval = setInterval(() => {
      console.clear();
      // DevTools ochilganini aniqlash uchun cheksiz debugger effekti (Vaqtincha sekinlashtiradi)
      const start = new Date();
      debugger;
      const end = new Date();
      if (end - start > 100) {
        showToast("DevTools detected! The system is freezing.", "error");
      }
    }, 300);

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('copy', preventActions);
      document.removeEventListener('cut', preventActions);
      document.removeEventListener('paste', preventActions);
      document.removeEventListener('selectstart', preventActions);
      document.removeEventListener('dragstart', preventActions);
      window.removeEventListener('keydown', preventKeys);
      clearInterval(consoleInterval);
    };
  }, [secureMode]);

  // ========================================================
  // MANTIQ 3: PAROL O'ZGARTIRISH (API CALL)
  // ========================================================
  const changePassword = async () => {
    setPassError('');
    if (!oldPass || !newPass || !confirmPass) {
      setPassError('Please fill in all fields.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords are appropriate kelmadi.');
      return;
    }
    setPassLoading(true);
    try {
      await userApi.updatePassword(oldPass, newPass);
      showToast('Password successfully updated', 'success');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      setPassError(err instanceof ApiError ? err.message : 'An error occurred.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="sub-page">
      <PageHeader title={t("profile_security")} />
      <div className="sub-page__body">

        {/* 🛑 SEKTOR 1: ULTRA-XAVFSIZ REJIM (MILITARY SHIELD) */}
        <div className={`fortress-card ${secureMode ? 'fortress-active' : ''}`}>
          <div className="fortress-header">
            <div className="fortress-icon">{secureMode ? '🛡️' : '🔓'}</div>
            <div className="fortress-title-block">
              <h4>Safe Mode (BETA)</h4>
              <p>Block all suspicious activity</p>
            </div>
            <input
              type="checkbox"
              className="ios-toggle"
              checked={secureMode}
              onChange={toggleSecureMode}
            />
          </div>
          {secureMode && (
            <div className="fortress-badge-list">
              <span className="f-badge">Safe Mode ACTIVE</span>
            </div>
          )}
        </div>

        {/* 📱 SEKTOR 2: APP LOCK (PIN-KOD BOSHQARUVI) */}
        <div className="security-box">
          <p className="sub-section-title">Application Protection (Beta)</p>
          <div className="pin-status-row">
            <div>
              <span className="status-label">Status:</span>
              <span className={`status-val ${isPinActive ? 'text-success' : 'text-danger'}`}>
                {isPinActive ? 'PIN Code Enabled' : 'Unprotected'}
              </span>
            </div>
            {pinMode === 'none' && (
              <Button size="small" onClick={() => setPinMode(isPinActive ? 'disable' : 'setup')}>
                {isPinActive ? 'Turn off' : 'Set PIN'}
              </Button>
            )}
          </div>

          {/* PIN Setup Interfeysi */}
          {pinMode === 'setup' && (
            <div className="pin-setup-zone">
              <div className="pin-type-selector">
                <button className={pinLength === 4 ? 'active' : ''} onClick={() => { setPinLength(4); setPinValue(''); setConfirmPinValue(''); }}>4 raqamli</button>
                <button className={pinLength === 6 ? 'active' : ''} onClick={() => { setPinLength(6); setPinValue(''); setConfirmPinValue(''); }}>6 raqamli</button>
              </div>
              <input
                type="password"
                className="pin-digit-input"
                maxLength={pinLength}
                placeholder={`New PIN with ${pinLength} digits`}
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
              />
              <input
                type="password"
                className="pin-digit-input"
                maxLength={pinLength}
                placeholder="Confirm PIN code"
                value={confirmPinValue}
                onChange={(e) => setConfirmPinValue(e.target.value.replace(/\D/g, ''))}
              />
              <div className="pin-actions">
                <button className="btn-cancel" onClick={() => setPinMode('none')}>Bekor qilish</button>
                <button className="btn-save" onClick={handleActivatePin}>Yoqish</button>
              </div>
            </div>
          )}

          {/* PIN Disable Interfeysi */}
          {pinMode === 'disable' && (
            <div className="pin-setup-zone">
              <p className="pin-warning-text">Enter your current password to remove the PIN code:</p>
              <input
                type="password"
                className="pin-digit-input"
                maxLength={Number(localStorage.getItem('secure_pin_length')) || 4}
                placeholder="Current PIN code"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
              />
              <div className="pin-actions">
                <button className="btn-cancel" onClick={() => setPinMode('none')}>Cancellation</button>
                <button className="btn-danger-action" onClick={handleDisablePin}>Tasdiqlash va O‘chirish</button>
              </div>
            </div>
          )}
        </div>

        {/* 🔑 SEKTOR 3: PAROL O'ZGARTIRISH (BACKEND TIZIMI) */}
        <div className="security-box">
          <p className="sub-section-title">Account password</p>
          {passError && <div className="sub-error" style={{ marginBottom: 12 }}>{passError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field
              label="Your old password"
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              icon={<IconLock width={18} height={18} />}
              placeholder="••••••••"
            />
            <Field
              label="New system password"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              icon={<IconLock width={18} height={18} />}
              placeholder="••••••••"
            />
            <Field
              label="Confirm new password"
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              icon={<IconLock width={18} height={18} />}
              placeholder="••••••••"
            />
            <Button fullWidth loading={passLoading} onClick={changePassword}>
             Update System Password
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
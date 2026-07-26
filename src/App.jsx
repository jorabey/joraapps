import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AppShell, PlainShell } from './components/layout/AppShell';
import { OrbitLoader } from './components/common/OrbitMark';
import { useViewportHeight } from './hooks/useViewportHeight';
import { useDisableContextMenu } from './hooks/useDisableContextMenu';
import { useEffect, useState } from 'react';

// Auth pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VerifyPage from './pages/Auth/VerifyPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

// App pages
import AppsPage from './pages/Apps/AppsPage';
import AppDetailPage from './pages/Apps/AppDetailPage';
import WebViewPage from './pages/Apps/WebViewPage';

// Profile pages
import ProfilePage from './pages/Profile/ProfilePage';
import ProfileEditPage from './pages/Profile/ProfileEditPage';
import SessionsPage from './pages/Profile/SessionsPage';
import AppConnectionsPage from './pages/Profile/AppConnectionsPage';
import SecurityPage from './pages/Profile/SecurityPage';
import LanguagePage from './pages/Profile/LanguagePage';
import AppInfoPage from './pages/Profile/AppInfoPage';

// ========================================================
// 🛡️ GLOBAL KIBERXAVFSIZLIK ENGINI (MILITARY SHIELD)
// ========================================================
export function useGlobalSecurityEngine() {
  useEffect(() => {
    const isSecureModeActive = localStorage.getItem('ultra_secure_mode') === 'true';
    if (!isSecureModeActive) return;

    // 1. SKRINSHOT VA VIDEO FORMATGA QARSHI STYLES INJEKSIYASI
    const styleNode = document.createElement("style");
    styleNode.innerHTML = `
      @media print { body { display: none !important; } }
      body.screen-protected { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
      body.screen-protected::after {
        content: "PROTECTED CONTENT"; position: fixed; inset: 0; 
        background: rgba(0,0,0,1); color: #ff3333; z-index: 9999999;
        display: none; align-items: center; justify-content: center; font-family: monospace; font-size: 24px;
      }
    `;
    document.head.appendChild(styleNode);
    document.body.classList.add('screen-protected');

    // 2. VIDEO VA MONITORINGDAN QOCHISH (Focus/Visibility masking)
    const handleVisibility = () => {
      if (document.hidden || document.visibilityState === 'unvisible') {
        document.body.style.filter = 'blur(40px) brightness(0) contrast(2)';
      } else {
        document.body.style.filter = 'none';
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', () => {
      document.body.style.filter = 'blur(40px) brightness(0) contrast(2)';
    });
    window.addEventListener('focus', () => {
      document.body.style.filter = 'none';
    });

    // 3. STORAGE PROXY GUARD (Faqat ruxsat berilgan kalitlar yoziladi)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const whitelist = ['secure_pin', 'secure_pin_length', 'ultra_secure_mode', 'pin_failed_attempts', 'accessToken', 'refreshToken', 'lang'];
      if (!whitelist.includes(key)) {
        console.error(`Blocked unwhitelisted local storage write: ${key}`);
        return;
      }
      originalSetItem.apply(this, arguments);
    };

    // 4. HAR 1 DAQIQADA BARCHA BAZALARNI METODIK TOZALASH (Auto-Wipe)
    const wipeInterval = setInterval(() => {
      const pin = localStorage.getItem('secure_pin');
      const pinLen = localStorage.getItem('secure_pin_length');
      const mode = localStorage.getItem('ultra_secure_mode');
      const token = localStorage.getItem('accessToken');
      const lang = localStorage.getItem('lang');

      localStorage.clear();
      sessionStorage.clear();

      if (pin) originalSetItem.call(localStorage, 'secure_pin', pin);
      if (pinLen) originalSetItem.call(localStorage, 'secure_pin_length', pinLen);
      if (mode) originalSetItem.call(localStorage, 'ultra_secure_mode', 'true');
      if (token) originalSetItem.call(localStorage, 'accessToken', token);
      if (lang) originalSetItem.call(localStorage, 'lang', lang);

      if (window.indexedDB && window.indexedDB.databases) {
        window.indexedDB.databases().then(dbs => {
          dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
        });
      }
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }, 60000);

    // 5. HARDWARE NUSXALASH VA EXPORTLARNI TAYIKLASH
    const blockEvents = (e) => e.preventDefault();
    document.addEventListener('copy', blockEvents);
    document.addEventListener('cut', blockEvents);
    document.addEventListener('paste', blockEvents);
    document.addEventListener('selectstart', blockEvents);
    document.addEventListener('dragstart', blockEvents);

    // 6. DEVTOOLS ANTI-TAMPER REJIMI (Console, Network va F12 Bloklash)
    const blockKeys = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'K')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S')
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockKeys);

    // DevTools ochishga urinilganda UI ni cheksiz sikl yordamida muzlatish
    const devToolsInterval = setInterval(() => {
      console.clear();
      const startTime = performance.now();
      debugger; // Agar DevTools ochiq bo'lsa, shu yerda kod to'xtaydi va crash bo'ladi
      if (performance.now() - startTime > 100) {
        document.body.innerHTML = "<div style='color:white;background:black;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;'>⚠️ SECURITY VIOLATION: DEVTOOLS DETECTED</div>";
        window.location.reload();
      }
    }, 1000);

    return () => {
      document.head.removeChild(styleNode);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(wipeInterval);
      clearInterval(devToolsInterval);
      document.removeEventListener('copy', blockEvents);
      document.removeEventListener('cut', blockEvents);
      document.removeEventListener('paste', blockEvents);
      document.removeEventListener('selectstart', blockEvents);
      document.removeEventListener('dragstart', blockEvents);
      window.removeEventListener('keydown', blockKeys);
    };
  }, []);
}

/* ---- Guards ---- */
function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
        <OrbitLoader size={44} />
      </div>
    );
  }
  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// RedirectIfAuth va AppLockWrapper kodlari o'zgarishsiz qoladi...
function RedirectIfAuth({ children }) {
  const { status } = useAuth();
  if (status === 'loading') {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
        <OrbitLoader size={44} />
      </div>
    );
  }
  if (status === 'authenticated') return <Navigate to="/apps" replace />;
  return children;
}

function AppLockWrapper({ children }) {
  const hasPin = !!localStorage.getItem('secure_pin');
  const [isLocked, setIsLocked] = useState(hasPin);
  const [inputPin, setInputPin] = useState('');
  const [lockTimeout, setLockTimeout] = useState(0);
  const pinLength = Number(localStorage.getItem('secure_pin_length')) || 4;
  const { logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (lockTimeout > 0) {
      const timer = setTimeout(() => setLockTimeout(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockTimeout]);

  if (!isLocked) return children;

  const handlePinSubmit = (val) => {
    const savedPin = localStorage.getItem('secure_pin');
    const currentAttempts = Number(localStorage.getItem('pin_failed_attempts')) || 0;

    if (val === savedPin) {
      localStorage.setItem('pin_failed_attempts', '0');
      setIsLocked(false);
    } else {
      const nextAttempts = currentAttempts + 1;
      localStorage.setItem('pin_failed_attempts', nextAttempts.toString());
      setInputPin('');

      if (nextAttempts >= 3) {
        setLockTimeout(30);
        localStorage.setItem('pin_failed_attempts', '0');
      }
      alert(`PIN xato! Urinishlar: ${nextAttempts}/3`);
    }
  };

  const handleKeyPress = (num) => {
    if (lockTimeout > 0) return;
    const nextVal = inputPin + num;
    if (nextVal.length <= pinLength) {
      setInputPin(nextVal);
      if (nextVal.length === pinLength) {
        setTimeout(() => handlePinSubmit(nextVal), 100);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#090a0f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif', color: '#fff', userSelect: 'none'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#a0a5b5', marginBottom: '24px' }}>
        {lockTimeout > 0 ? `Tizim qulflangan. Kuting: ${lockTimeout}s` : 'Ilova PIN-kodini kiriting'}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        {Array.from({ length: pinLength }).map((_, i) => (
          <div key={i} style={{
            width: '14px', height: '14px', borderRadius: '50%',
            background: i < inputPin.length ? '#3498db' : '#2c313c',
            boxShadow: i < inputPin.length ? '0 0 10px #3498db' : 'none',
            transition: 'all 0.1s'
          }} />
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 70px)', gap: '20px', justifyContent: 'center', opacity: lockTimeout > 0 ? 0.3 : 1
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handleKeyPress(num.toString())} style={keyStyle}>{num}</button>
        ))}
        <button onClick={() => setInputPin('')} style={{ ...keyStyle, fontSize: '12px', color: '#e74c3c' }}>C</button>
        <button onClick={() => handleKeyPress('0')} style={keyStyle}>0</button>
        <button onClick={() => setInputPin(prev => prev.slice(0, -1))} style={{ ...keyStyle, fontSize: '14px' }}>⌫</button>
        <button onClick={async () =>{
          await onLogout();
          setIsLocked(false);
        }} style={{ fontSize: '12px', color: '#e74c3c' }}>Log out</button>
      </div>
    </div>
  );
}

const keyStyle = {
  width: '70px', height: '70px', borderRadius: '50%', background: '#1c1f26',
  border: '1px solid #2c313c', color: '#fff', fontSize: '22px', fontWeight: '500',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  outline: 'none'
};

// ========================================================
// MAIN APP COMPONENT
// ========================================================
export default function App() {
  useViewportHeight();
  useDisableContextMenu();
  useGlobalSecurityEngine();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {

    // 2. HAQIQIY INTERNETNI TEKSHIRISH (PING TIZIMI)
    const checkRealPing = async () => {
      try {
        const response = await fetch('/manifest.json', { method: 'HEAD', cache: 'no-store' });
        if (response.ok) {
          setIsOnline(true);
          if (!window.isUserPlaying && window.location.pathname === '/offline.html') {
            window.location.href = '/apps';
          }
        }
      } catch (e) {
        setIsOnline(false);
      }
    };

    const handleOnline = () => checkRealPing();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkRealPing, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <LangProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppLockWrapper>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route
                  path="/login"
                  element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>}
                />
                <Route
                  path="/register"
                  element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>}
                />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route
                  path="/run/:username"
                  element={<RequireAuth><WebViewPage /></RequireAuth>}
                />

                <Route element={<PlainShell />}>
                  <Route path="/:username" element={<AppDetailPage />} />
                </Route>

                <Route
                  element={
                    <RequireAuth>
                      <AppShell />
                    </RequireAuth>
                  }
                >
                  <Route path="/apps" element={<AppsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route element={<PlainShell />}>
                  <Route path="/profile-edit" element={<RequireAuth><ProfileEditPage /></RequireAuth>} />
                  <Route path="/sessions" element={<RequireAuth><SessionsPage /></RequireAuth>} />
                  <Route path="/app-connections" element={<RequireAuth><AppConnectionsPage /></RequireAuth>} />
                  <Route path="/security" element={<RequireAuth><SecurityPage /></RequireAuth>} />
                  <Route path="/language" element={<RequireAuth><LanguagePage /></RequireAuth>} />
                  <Route path="/app-info" element={<RequireAuth><AppInfoPage /></RequireAuth>} />
                </Route>
              </Routes>
            </AppLockWrapper>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </LangProvider>
  );
}
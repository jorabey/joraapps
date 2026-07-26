// O'yin holatini belgilovchi global o'zgaruvchi (O'yin ichidagi kod bilan bog'lanadi)
window.isUserPlaying = false; 
let updatePending = false;

// 1. SERVICE WORKERNI RO'YXATDAN O'TKAZISH
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      
      // Yangilanishlarni tekshirish (Vercel uchun)
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Yangi versiya yuklab bo'lindi, lekin darhol yangilamaymiz (O'yinni buzmaslik uchun)
            updatePending = true;
            tryTriggerUpdate();
          }
        });
      });
    });
  });
}

// O'yin tugaganda ushbu funksiyani chaqirasiz
function onGameOver() {
  window.isUserPlaying = false;
  if (updatePending) {
    // Agar fonda yangilanish kutib turgan bo'lsa, o'yin tugashi bilan sahifa yangilanadi
    window.location.reload();
  }
}

function tryTriggerUpdate() {
  if (!window.isUserPlaying) {
    window.location.reload();
  }
}

// 2. REAL-TIME INTERNET MONITORING (Ulanish qaytganda avtomatik o'tish)
window.addEventListener('online', async () => {
  // Shunchaki Wi-Fi emas, haqiqiy internet borligini tekshiramiz
  const hasInternet = await checkRealPing();
  if (hasInternet && !window.isUserPlaying) {
    window.location.href = '/apps'; // Internet kelsa va foydalanuvchi band bo'lmasa asosiy sahifaga qaytadi
  }
});

async function checkRealPing() {
  try {
    const response = await fetch('/manifest.json', { method: 'HEAD', cache: 'no-store' });
    return response.ok;
  } catch (e) {
    return false;
  }
}

// 3. PUSH NOTIFICATION UCHUN PROFESSIONAL RUXSAT SO'RASH
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Bildirishnomalarga ruxsat berildi!');
      // Bu yerda serverga token yuborish kodi bo'ladi
    }
  }
}
// Foydalanuvchi ilovaga kirgandan so'ng ma'lum vaqt o'tgach ruxsat so'rash (Professional UX)
setTimeout(requestNotificationPermission, 5000);
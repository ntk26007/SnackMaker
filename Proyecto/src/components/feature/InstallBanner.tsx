import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // No mostrar en Electron
    const isElectron =
      window.location.protocol === 'file:' ||
      navigator.userAgent.toLowerCase().includes('electron');
    if (isElectron) return;

    // No mostrar si ya está instalada como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Mostrar banner en iOS, Android y escritorio web
    if (ios) setShowBanner(true);
    if (!mobile) setShowBanner(true);
    if (mobile && !ios) setShowBanner(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => setShowBanner(false);

  if (!showBanner || installed) return null;

  // --- iOS: instrucciones manuales ---
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-900 border border-pink-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <span className="text-2xl">🍿</span>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Instala SnackMaker en tu iPhone</p>
          <p className="text-gray-400 text-xs mt-1">
            Pulsa <strong className="text-white">Compartir</strong> <span>⬆️</span> y luego <strong className="text-white">"Añadir a pantalla de inicio"</strong>
          </p>
        </div>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
      </div>
    );
  }

  // --- Android: descarga del APK ---
  if (isMobile && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-gray-900 border border-pink-500 rounded-xl p-3 shadow-2xl flex items-center gap-2 max-w-xs">
        <span className="text-lg">📱</span>
        <div className="flex-1">
          <p className="text-white font-semibold text-xs">App móvil disponible</p>
          <p className="text-gray-400 text-xs">Descarga SnackMaker para Android</p>
        </div>
        <a
          href="https://github.com/ntk26007/SnackMaker/releases/download/v1.0.0-android/app-debug.apk"
          download
          className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Descargar
        </a>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-white text-sm leading-none">✕</button>
      </div>
    );
  }

  // --- Escritorio web: descarga del .exe ---
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-900 border border-pink-500 rounded-xl p-3 shadow-2xl flex items-center gap-2 max-w-xs">
      <span className="text-lg">💻</span>
      <div className="flex-1">
        <p className="text-white font-semibold text-xs">App de escritorio disponible</p>
        <p className="text-gray-400 text-xs">Descarga SnackMaker para Windows</p>
      </div>
      <a
        href="https://github.com/ntk26007/SnackMaker/releases/download/v.1.0.0/SnackMaker.Setup.1.0.0.exe"
        download
        className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Descargar
      </a>
      <button onClick={handleDismiss} className="text-gray-500 hover:text-white text-sm leading-none">✕</button>
    </div>
  );
}
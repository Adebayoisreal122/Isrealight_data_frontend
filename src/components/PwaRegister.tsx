'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}

export function InstallButton() {
  const [evt, setEvt] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setInstalled(!!standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || (!evt && !ios)) return null;

  const click = async () => {
    if (evt) { evt.prompt(); await evt.userChoice; setEvt(null); }
    else alert('To install: tap the Share button, then "Add to Home Screen".');
  };

  return (
    <button onClick={click} className="btn btn-gold !px-3 !py-2">
      <Download size={16} /> <span className="hidden sm:inline">Install app</span>
    </button>
  );
}

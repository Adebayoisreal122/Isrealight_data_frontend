import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import PwaRegister from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: { default: 'Isrealight Data Hub', template: '%s | Isrealight Data Hub' },
  description: 'Buy airtime, data, cable TV and pay electricity bills instantly.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Isrealight', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#2449d6',
  width: 'device-width',
  initialScale: 1,
};

// Applies the saved theme before first paint (no flash). Default is light.
const themeScript = `try{if(localStorage.getItem('ihub_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}

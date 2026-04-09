import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n';
import Nav from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'çç²æå¸ KÅhÄ« TechÅ',
  description: 'ä¸æä¸çã»æ¯æ¯é½å¼å¾è¨ä½ãå°ç£åå¡äººçåèæå¸èåå¡å°åã',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <I18nProvider>
          <Nav />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/theme/theme-provider';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Octagon Poker',
  description: 'Private record book for our home game',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={manrope.variable} suppressHydrationWarning>
      <body className='min-h-dvh font-sans'>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Animeflix',
  description: 'Watch your favorite anime',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#141414] text-white" suppressHydrationWarning>{children}</body>
    </html>
  );
}

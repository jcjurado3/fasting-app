import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Still — Your fasting companion', description: 'A little intention. A little growth. Your personal 72-hour fasting journal.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }

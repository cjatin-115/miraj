import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Miraaj V1 — AI Short-Form Video Generation Pipeline',
  description: 'Personal AI-powered short-form video generation pipeline transforming webcam recordings into high-impact vertical edits.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-yellow-400 selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

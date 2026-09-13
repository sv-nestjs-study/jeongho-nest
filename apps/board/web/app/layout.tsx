import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nest Board',
  description: 'Nest CRUD 학습용 게시판',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

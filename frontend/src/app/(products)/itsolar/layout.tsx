// src/app/(products)/itsolar/layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ITSolar ERP',
  description: 'Система управления солнечной энергетикой',
};

export default function ITSolarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Здесь можно добавить общие элементы для всего продукта ITSolar */}
      {/* Например: Analytics, ErrorBoundary, Theme Provider */}
      {children}
    </>
  );
}
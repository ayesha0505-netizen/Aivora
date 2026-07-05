import React from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';

export default function ListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}

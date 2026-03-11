'use client';
import type { ReactNode } from 'react';

interface Props {
  sidebar: ReactNode;
  chat: ReactNode;
  panel: ReactNode;
}

export function AppLayout({ sidebar, chat, panel}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {sidebar}
      {chat}
      {panel}
    </div>
  );
}
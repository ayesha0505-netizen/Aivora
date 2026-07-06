"use client";

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { SideNavBar } from '@/components/layout/SideNavBar';
import { TopNavBar } from '@/components/layout/TopNavBar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();
  
  return (
    <div className="flex bg-background text-on-background selection:bg-primary-fixed min-h-screen">
      <SideNavBar />
      <div 
        className={`flex flex-col flex-1 w-full min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "md:ml-72" : "md:ml-0"
        }`}
      >
        <TopNavBar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

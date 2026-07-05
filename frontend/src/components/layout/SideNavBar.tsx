"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarProfileMenu } from './SidebarProfileMenu';
import { useSidebar } from '@/context/SidebarContext';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  filled: boolean;
  subItems?: { name: string; href: string; icon: string }[];
}

export function SideNavBar() {
  const pathname = usePathname() || '';
  const [listOpen, setListOpen] = useState(true);
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleNewEntry = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-new-entry-modal"));
    }
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', filled: false },
    { name: 'AI Assistant', href: '/assistant', icon: 'smart_toy', filled: false },
    { name: 'Calendar', href: '/calendar', icon: 'calendar_today', filled: false },
    { name: 'Notes', href: '/notes', icon: 'description', filled: false },
    { name: 'Reminders', href: '/reminders', icon: 'notifications', filled: false },
    { name: 'Weather', href: '/weather', icon: 'partly_cloudy_day', filled: false },
    { name: 'Budget Planner', href: '/budget', icon: 'account_balance_wallet', filled: false },
    { name: 'Personal Diary', href: '/diary', icon: 'auto_stories', filled: false },
    {
      name: 'List',
      href: '/list',
      icon: 'list_alt',
      filled: false,
    },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-none"} hidden md:flex flex-col p-4 bg-surface-container-low shadow-lg shadow-primary/5 border-r border-outline-variant/20`}>
      <div className="w-64 h-full shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-6 px-2 shrink-0">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img src="/logo-icon.png" alt="Aivora Logo" className="w-[55px] h-[55px] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0" />
            <div>
              <h1 className="text-headline-sm font-headline font-black bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">Aivora</h1>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Your everyday ai companion</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">left_panel_close</span>
          </button>
        </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || (item.name === 'Reminders' && (pathname.startsWith('/reminders') || pathname.startsWith('/remainder')));
          const hasSubItems = Boolean(item.subItems);
          const isSubOpen = hasSubItems && (isActive || listOpen);

          return (
            <div key={item.name} className="space-y-1">
              {hasSubItems ? (
                <div className="flex flex-col">
                  <div
                    onClick={() => setListOpen(!listOpen)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-full font-body text-label-lg transition-all duration-300 cursor-pointer group ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container shadow-md shadow-primary/20 font-bold'
                        : 'text-on-surface-variant hover:bg-primary-fixed-dim/20 hover:translate-x-1'
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-3 flex-1" onClick={(e) => e.stopPropagation()}>
                      <span
                        className="material-symbols-outlined transition-transform group-hover:scale-110"
                        style={{ fontVariationSettings: isActive || item.filled ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                    <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isSubOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                  {isSubOpen && item.subItems && (
                    <div className="pl-9 pr-2 space-y-1 py-1 border-l-2 border-primary/20 ml-6 mt-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = typeof window !== 'undefined' && window.location.search.includes(sub.href.split('?')[1] || '');
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-sm font-body transition-all duration-200 ${
                              isSubActive
                                ? 'bg-primary/15 text-primary font-bold'
                                : 'text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-variant/50'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">{sub.icon}</span>
                            <span>{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full font-body text-label-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-md shadow-primary/20 font-bold'
                      : 'text-on-surface-variant hover:bg-primary-fixed-dim/20 hover:translate-x-1'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined transition-transform ${
                      isActive ? '' : 'group-hover:scale-110'
                    }`}
                    style={{ fontVariationSettings: isActive || item.filled ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
      <SidebarProfileMenu />
      </div>
    </aside>
  );
}


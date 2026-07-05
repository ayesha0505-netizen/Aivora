"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';

export function TopNavBar() {
  const { theme } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname() || '';
  const isCalendar = pathname.startsWith('/calendar');
  const isNotes = pathname.startsWith('/notes');
  const isAssistant = pathname.startsWith('/assistant');
  const isReminders = pathname.startsWith('/remainder') || pathname.startsWith('/reminders');
  const isWeather = pathname.startsWith('/weather');
  const isBudget = pathname.startsWith('/budget');
  const isDiary = pathname.startsWith('/diary');
  const isList = pathname.startsWith('/list');
  const isSettings = pathname.startsWith('/settings');
  const isSupport = pathname.startsWith('/support');

  const hasCustomSearch = isCalendar || isNotes || isReminders || isWeather || isBudget || isDiary || isList || isSettings || isSupport;

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-8 py-4 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-surface-container-highest/20">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2 text-on-surface hover:bg-surface-variant/50 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">menu</span>
          </button>
          {!isSidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-2 text-on-surface hover:bg-surface-variant/50 rounded-full transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
          <img src="/logo-icon.png" alt="Aivora Logo" className="w-[55px] h-[55px] object-contain drop-shadow md:hidden" />
        </div>
        {isCalendar ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Calendar</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" 
                placeholder="Search events, notes..." 
                type="text"
                onChange={(e) => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('calendar-search', { detail: e.target.value }));
                  }
                }}
              />
            </div>
          </>
        ) : isNotes ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Notes</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" placeholder="Search notes..." type="text" />
            </div>
          </>
        ) : isReminders ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Reminders</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" 
                placeholder="Search reminders..." 
                type="text" 
                onChange={(e) => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reminders-search', { detail: e.target.value }));
                  }
                }}
              />
            </div>
          </>
        ) : isWeather ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Weather Forecast</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">location_on</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" 
                placeholder="Search city or location..." 
                type="text" 
                onChange={(e) => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('weather-search', { detail: e.target.value }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('weather-search', { detail: e.currentTarget.value }));
                  }
                }}
              />
            </div>
          </>
        ) : isBudget ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Budget Planner</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" placeholder="Search expenses, budgets..." type="text" />
            </div>
          </>
        ) : isDiary ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Personal Diary</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" placeholder="Search entries, tags, moods..." type="text" />
            </div>
          </>
        ) : isList ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">My Lists</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" placeholder="Search notes and checklists..." type="text" />
            </div>
          </>
        ) : isAssistant ? (
          <h2 className="text-headline-sm font-headline font-bold text-primary">AI Assistant</h2>
        ) : isSettings ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Profile &amp; Settings</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" placeholder="Search settings, integrations..." type="text" />
            </div>
          </>
        ) : isSupport ? (
          <>
            <h2 className="text-headline-sm font-headline font-bold text-primary">Help &amp; Support</h2>
            <div className="hidden md:flex items-center bg-surface-variant/50 rounded-full px-4 py-2 w-96 border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 outline-none" placeholder="Search FAQs, tutorials, docs..." type="text" />
            </div>
          </>
        ) : (
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-label-md font-medium text-primary font-bold border-b-2 border-primary py-1">Overview</span>
            <span className="text-label-md font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Analytics</span>
            <span className="text-label-md font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Sharing</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {!hasCustomSearch && (
          <div className="relative group hidden sm:block">
            <input className="bg-surface-variant/50 border-none rounded-full px-5 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/30 transition-all outline-none" placeholder="Search activities..." type="text" />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          </div>
        )}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-all bouncy">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        
      </div>
    </header>
  );
}


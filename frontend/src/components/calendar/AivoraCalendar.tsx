"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: number; // Day of the month (1-31)
  month: number; // 0-11 (9 = Oct)
  year: number;
  category: string;
  color: 'primary' | 'secondary' | 'tertiary';
  location: string;
  description: string;
  attendees?: string[];
  extraAttendeesCount?: number;
}



const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AivoraCalendar() {
  const [now] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<number>(now.getDate());
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Event Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [newDateStr, setNewDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [newCategory, setNewCategory] = useState<string>('Work');
  const [newColor, setNewColor] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [newLocation, setNewLocation] = useState<string>('Online / Office');
  const [newDesc, setNewDesc] = useState<string>('');

  // Listen to custom event from SideNavBar and search events
  useEffect(() => {
    const handleOpenNewEntry = () => {
      const d = new Date(currentYear, currentMonth, selectedDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setNewDateStr(`${yyyy}-${mm}-${dd}`);
      setIsNewEntryModalOpen(true);
    };
    const handleSearch = (e: Event) => {
      setSearchQuery((e as CustomEvent).detail || '');
    };
    window.addEventListener("open-new-entry-modal", handleOpenNewEntry);
    window.addEventListener("calendar-search", handleSearch);

    // Fetch real calendar API events
    const fetchRealEvents = async () => {
      try {
        const apiEvents = await api.getEvents();
        if (apiEvents && apiEvents.length > 0) {
          const formatted: CalendarEvent[] = apiEvents.map(e => {
            const dt = new Date(e.event_time);
            return {
              id: e.id,
              title: e.title,
              time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: dt.getDate(),
              month: dt.getMonth(),
              year: dt.getFullYear(),
              category: e.event_type === 'video' ? 'Work' : e.event_type === 'fitness' ? 'Health & Wellness' : 'General',
              color: e.event_type === 'video' ? 'primary' : e.event_type === 'fitness' ? 'secondary' : 'tertiary',
              location: e.location || 'Online / Office',
              description: e.description || 'No additional description provided.',
              attendees: [],
              extraAttendeesCount: 0
            };
          });
          setEvents(formatted);
        }
      } catch (err) {
        console.warn("Could not fetch API calendar events:", err);
      }
    };
    fetchRealEvents();

    return () => {
      window.removeEventListener("open-new-entry-modal", handleOpenNewEntry);
      window.removeEventListener("calendar-search", handleSearch);
    };
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today.getDate());
  };

  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 200);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [y, m, d] = newDateStr.split('-').map(Number);
    const eventYear = y || currentYear;
    const eventMonth = m ? m - 1 : currentMonth;
    const eventDate = d || 1;

    const [sh, sm] = startTime.split(':').map(Number);
    const eventDateObj = new Date(eventYear, eventMonth, eventDate, sh || 9, sm || 0, 0);
    const eventTimeIso = eventDateObj.toISOString();

    const format12h = (t24: string) => {
      if (!t24) return '';
      const [hours, mins] = t24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
    };
    const formattedTime = `${format12h(startTime)} - ${format12h(endTime)}`;

    const created: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle,
      time: formattedTime,
      date: eventDate,
      month: eventMonth,
      year: eventYear,
      category: newCategory.trim() || 'General',
      color: newColor,
      location: newLocation || 'Remote',
      description: newDesc || 'No additional description provided.',
      attendees: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCwW-IYeYvHVWdivKlZJN9sYcM8ehhRSqbAPzLCoUkAhKuLLIeySQcZE3h2aG5cTAsjOEmWmONiu3g0W7kY0nOOsQmESgkmjxl7u8KIddeTzwf-pMi55m6EGRVEB7mK4l0FGMfeyfROZ9OxSjPq-uMbBO1u4gANdkdzptJSjsPwuEVqRTZTFtEvDCJ-PMpB4EFZcs_CJh3ikAGWeMGfsXV5JyWsEYYgFZmeBGJ9bu5ilsM_TOKUJelS1A'
      ]
    };

    setEvents(prev => [...prev, created]);
    setCurrentYear(eventYear);
    setCurrentMonth(eventMonth);
    setSelectedDate(eventDate);
    setIsNewEntryModalOpen(false);
    setNewTitle('');
    setNewDesc('');

    try {
      const apiRes = await api.createEvent(newTitle, eventTimeIso, newDesc, newLocation, (newCategory.trim() || 'General').toLowerCase());
      if (apiRes && apiRes.id) {
        setEvents(prev => prev.map(ev => ev.id === created.id ? { ...ev, id: apiRes.id } : ev));
      }
    } catch (err) {
      console.warn("Failed to persist event to API:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    closeEventModal();
    if (!id.startsWith('ev-')) {
      try {
        await api.deleteEvent(id);
      } catch (err) {
        console.warn("Failed to delete event from API:", err);
      }
    }
  };

  // Helper to calculate days in month and starting weekday
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDaysOfWeek = (year: number, month: number, day: number) => {
    const dt = new Date(year, month, day);
    const dayOfWeek = dt.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(year, month, day - dayOfWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateNum: d.getDate(),
        monthNum: d.getMonth(),
        yearNum: d.getFullYear(),
        dayName: WEEK_DAYS[i],
      });
    }
    return days;
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfWeek(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

  const filteredEvents = events.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const dateStr = `${MONTH_NAMES[e.month]} ${e.date} ${e.year}`.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      dateStr.includes(q)
    );
  });

  const displayEvents = searchQuery.trim() ? filteredEvents : events;

  // Generate grid calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    calendarCells.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      events: []
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dayEvents = displayEvents.filter(e => e.date === day && e.month === currentMonth && e.year === currentYear);
    calendarCells.push({
      date: day,
      isCurrentMonth: true,
      isPrevMonth: false,
      events: dayEvents
    });
  }

  // Next month leading days to complete grid (42 cells max for 6 rows)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarCells.push({
      date: day,
      isCurrentMonth: false,
      isPrevMonth: false,
      events: []
    });
  }

  // Helper to style tag pills based on color
  const getTagColorClass = (color: 'primary' | 'secondary' | 'tertiary') => {
    if (color === 'primary') {
      return 'bg-primary/10 border-l-4 border-primary text-primary';
    } else if (color === 'secondary') {
      return 'bg-secondary/10 border-l-4 border-secondary text-secondary';
    } else {
      return 'bg-tertiary/10 border-l-4 border-tertiary text-tertiary';
    }
  };

  const getModalTagClass = (color: 'primary' | 'secondary' | 'tertiary') => {
    if (color === 'primary') {
      return 'bg-primary-fixed text-on-primary-fixed';
    } else if (color === 'secondary') {
      return 'bg-secondary-fixed text-on-secondary-fixed';
    } else {
      return 'bg-tertiary-fixed text-on-tertiary-fixed';
    }
  };

  return (
    <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col gap-6 bg-background text-on-background relative">
      {/* Controls & View Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-2xl font-black text-secondary">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <div className="flex bg-surface-container rounded-full p-1 shadow-inner">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-white dark:hover:bg-surface-variant transition-all cursor-pointer"
                title="Previous Month"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button 
                onClick={handleToday}
                className="px-4 text-sm font-bold hover:bg-white dark:hover:bg-surface-variant rounded-full transition-all cursor-pointer"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-white dark:hover:bg-surface-variant transition-all cursor-pointer"
                title="Next Month"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            {/* Go to Date Picker */}
            <div className="relative flex items-center bg-surface-container-low dark:bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30 shadow-sm hover:border-primary/50 transition-colors">
              <span className="material-symbols-outlined text-primary text-sm mr-1.5">calendar_today</span>
              <span className="text-xs font-bold text-on-surface-variant mr-1">Go to:</span>
              <input
                type="date"
                value={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    if (y && m && d) {
                      setCurrentYear(y);
                      setCurrentMonth(m - 1);
                      setSelectedDate(d);
                    }
                  }
                }}
                className="bg-transparent border-none text-xs font-bold text-on-surface outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Bar inside Calendar */}
            <div className="flex items-center bg-surface-container-low dark:bg-surface-container rounded-full px-4 py-1.5 border border-outline-variant/30 w-full sm:w-64 shadow-inner">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schedule or date..."
                className="bg-transparent border-none text-xs w-full outline-none text-on-surface placeholder:text-on-surface-variant/60 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-on-surface flex items-center cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            <div className="flex bg-surface-container p-1 rounded-full shadow-inner">
              <button 
                id="monthViewBtn"
                onClick={() => setViewMode('month')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === 'month' 
                    ? 'bg-white dark:bg-surface-variant text-primary shadow-sm font-black' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Month
              </button>
              <button 
                id="weekViewBtn"
                onClick={() => setViewMode('week')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === 'week' 
                    ? 'bg-white dark:bg-surface-variant text-primary shadow-sm font-black' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Week
              </button>
              <button 
                id="dayViewBtn"
                onClick={() => setViewMode('day')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === 'day' 
                    ? 'bg-white dark:bg-surface-variant text-primary shadow-sm font-black' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Summary Panel */}
        {searchQuery.trim() !== '' && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 transition-all animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">manage_search</span>
                Found {filteredEvents.length} matching event{filteredEvents.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              </span>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-on-surface-variant hover:text-primary cursor-pointer underline"
              >
                Clear Search
              </button>
            </div>
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-on-surface-variant font-medium py-2">No matching events found in your schedule.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
                {filteredEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setCurrentYear(ev.year);
                      setCurrentMonth(ev.month);
                      setSelectedDate(ev.date);
                      openEventModal(ev);
                    }}
                    className={`p-3 rounded-xl border bg-white dark:bg-surface-container cursor-pointer hover:shadow-md transition-all flex flex-col justify-between ${
                      ev.color === 'primary' ? 'border-l-4 border-l-primary' : ev.color === 'secondary' ? 'border-l-4 border-l-secondary' : 'border-l-4 border-l-tertiary'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant mb-1">
                        <span>{MONTH_NAMES[ev.month]} {ev.date}, {ev.year}</span>
                        <span className="uppercase text-[9px] px-2 py-0.5 rounded bg-surface-variant/50">{ev.category}</span>
                      </div>
                      <h5 className="text-xs font-black text-on-surface truncate">{ev.title}</h5>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/80 mt-1 truncate">{ev.location} • {ev.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar View Container */}
      <div className="flex-1 bg-white dark:bg-surface-container-lowest rounded-lg shadow-xl shadow-secondary/5 border border-surface-variant overflow-hidden flex flex-col min-h-[500px]">
        {/* Month View */}
        {viewMode === 'month' && (
          <>
            {/* Day Labels */}
            <div className="grid calendar-grid border-b border-surface-variant bg-surface-container-low/50 dark:bg-surface-container/30">
              {WEEK_DAYS.map(day => (
                <div key={day} className="py-3 text-center text-xs font-black text-on-surface-variant uppercase tracking-tighter">
                  {day}
                </div>
              ))}
            </div>

            {/* Monthly Grid */}
            <div className="flex-1 grid calendar-grid auto-rows-fr overflow-y-auto no-scrollbar">
              {calendarCells.map((cell, idx) => {
                const isToday = cell.isCurrentMonth && cell.date === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (cell.isCurrentMonth) setSelectedDate(cell.date);
                    }}
                    className={`p-2 border-r border-b border-surface-variant group hover:bg-surface-variant/20 transition-colors flex flex-col min-h-[100px] ${
                      !cell.isCurrentMonth ? 'bg-surface/30 dark:bg-surface-container-lowest/40 opacity-50' : ''
                    } ${isToday ? 'bg-primary-fixed/20 dark:bg-primary-fixed/10 relative' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-black ${
                        isToday 
                          ? 'text-primary px-2 py-0.5 rounded-full bg-primary/10 font-bold' 
                          : cell.isCurrentMonth 
                          ? 'text-on-surface-variant' 
                          : 'text-outline'
                      }`}>
                        {cell.date}
                      </span>
                      {isToday && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" title="Today"></div>
                      )}
                    </div>

                    {/* Events list in cell */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {cell.events.map(event => (
                        <div 
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEventModal(event);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold truncate bouncy cursor-pointer transition-transform ${getTagColorClass(event.color)} ${
                            event.id === 'ev-4' ? 'font-black bg-primary/20 text-primary' : ''
                          }`}
                          title={`${event.title} (${event.time})`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Week View */}
        {viewMode === 'week' && (() => {
          const weekDaysList = getDaysOfWeek(currentYear, currentMonth, selectedDate);
          return (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="grid grid-cols-8 border-b border-surface-variant bg-surface-container-low/50 py-3 text-center text-xs font-black uppercase text-on-surface-variant">
                <div className="border-r border-surface-variant">Time</div>
                {weekDaysList.map((wd, idx) => {
                  const isSelected = wd.dateNum === selectedDate && wd.monthNum === currentMonth && wd.yearNum === currentYear;
                  return (
                    <div 
                      key={idx} 
                      className={`cursor-pointer ${isSelected ? 'text-primary font-black' : ''}`} 
                      onClick={() => {
                        setCurrentYear(wd.yearNum);
                        setCurrentMonth(wd.monthNum);
                        setSelectedDate(wd.dateNum);
                      }}
                    >
                      <div>{wd.dayName}</div>
                      <div className={`text-base mt-0.5 ${isSelected ? 'inline-block px-2 py-0.5 bg-primary text-white rounded-full' : ''}`}>{wd.dateNum}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-surface-variant/40">
                {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map((timeStr, timeIdx) => (
                  <div key={timeStr} className="grid grid-cols-8 min-h-[70px] group hover:bg-surface-variant/5 transition-colors">
                    <div className="border-r border-surface-variant text-[11px] font-bold text-on-surface-variant/60 p-2 text-right">
                      {timeStr}
                    </div>
                    {weekDaysList.map((wd, dayIdx) => {
                      const matchingEvents = displayEvents.filter(e => 
                        e.date === wd.dateNum && 
                        e.month === wd.monthNum && 
                        e.year === wd.yearNum && 
                        (e.time.startsWith(timeStr.slice(0, 2)) || (wd.dateNum === 9 && timeIdx === 1))
                      );
                      return (
                        <div key={dayIdx} className="border-r border-surface-variant p-1 relative">
                          {matchingEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => openEventModal(event)}
                              className={`p-2 rounded-lg text-xs font-bold bouncy cursor-pointer ${getTagColorClass(event.color)} shadow-sm`}
                            >
                              <p className="font-black truncate">{event.title}</p>
                              <p className="text-[10px] opacity-80 truncate">{event.location}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-surface-variant pb-4 mb-4">
              <div>
                <h4 className="text-3xl font-black text-primary">
                  {WEEK_DAYS[new Date(currentYear, currentMonth, selectedDate).getDay()]}, {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear}
                </h4>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  {displayEvents.filter(e => e.date === selectedDate && e.month === currentMonth && e.year === currentYear).length} scheduled activities today
                </p>
              </div>
              <button 
                onClick={() => { 
                  const yyyy = currentYear;
                  const mm = String(currentMonth + 1).padStart(2, '0');
                  const dd = String(selectedDate).padStart(2, '0');
                  setNewDateStr(`${yyyy}-${mm}-${dd}`);
                  setIsNewEntryModalOpen(true); 
                }}
                className="px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm bouncy pink-glow flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add to this day
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {displayEvents.filter(e => e.date === selectedDate && e.month === currentMonth && e.year === currentYear).length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-surface-container/30 rounded-2xl border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">event_busy</span>
                  <p className="text-base font-bold text-on-surface-variant">No events scheduled for {MONTH_NAMES[currentMonth]} {selectedDate}</p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Click &quot;Add to this day&quot; or use the AI Assistant to automatically organize your schedule.</p>
                </div>
              ) : (
                displayEvents.filter(e => e.date === selectedDate && e.month === currentMonth && e.year === currentYear).map(event => (
                  <div 
                    key={event.id}
                    onClick={() => openEventModal(event)}
                    className={`p-5 rounded-2xl border transition-all duration-300 bouncy cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                      event.color === 'primary' 
                        ? 'bg-primary/5 border-primary/30 hover:bg-primary/10' 
                        : event.color === 'secondary'
                        ? 'bg-secondary/5 border-secondary/30 hover:bg-secondary/10'
                        : 'bg-tertiary/5 border-tertiary/30 hover:bg-tertiary/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 ${
                        event.color === 'primary' ? 'bg-primary pink-glow' : event.color === 'secondary' ? 'bg-secondary purple-glow' : 'bg-tertiary blue-glow'
                      }`}>
                        <span className="material-symbols-outlined">
                          {event.category === 'Health & Wellness' ? 'self_improvement' : event.category === 'Work' ? 'work' : event.category === 'Milestone' ? 'rocket_launch' : 'event'}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${getModalTagClass(event.color)}`}>
                          {event.category}
                        </span>
                        <h5 className="text-xl font-black text-on-surface">{event.title}</h5>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-on-surface-variant mt-1">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {event.location}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant/80 mt-2 line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex -space-x-2 mr-2">
                          {event.attendees.map((img, i) => (
                            <div key={i} className="relative w-8 h-8 rounded-full border-2 border-white dark:border-surface overflow-hidden">
                              <Image src={img} alt="Attendee" fill className="object-cover" unoptimized />
                            </div>
                          ))}
                          {event.extraAttendeesCount && (
                            <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-white dark:border-surface flex items-center justify-center text-[10px] font-bold text-on-secondary-container">
                              +{event.extraAttendeesCount}
                            </div>
                          )}
                        </div>
                      )}
                      <button className="px-4 py-2 rounded-full font-bold text-xs bg-white dark:bg-surface-variant border border-outline-variant/40 hover:bg-surface transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* FAB for Desktop & Mobile Context */}
      <button 
        onClick={() => setIsNewEntryModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl pink-glow bouncy active:scale-90 transition-transform z-50 cursor-pointer group"
        title="New Calendar Entry"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>

      {/* Event Detail Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-surface-container-lowest w-full max-w-md rounded-2xl p-8 shadow-2xl border border-outline-variant/30 transform scale-100 transition-transform duration-300 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getModalTagClass(selectedEvent.color)}`}>
                {selectedEvent.category}
              </div>
              <button 
                onClick={closeEventModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <h3 className="text-3xl font-black text-on-surface mb-2">{selectedEvent.title}</h3>
            
            <div className="flex flex-col gap-2 text-on-surface-variant mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                <span className="text-sm font-medium">{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-secondary">location_on</span>
                <span className="text-sm font-medium">{selectedEvent.location}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-on-surface-variant leading-relaxed text-sm bg-surface-container-low dark:bg-surface-container/20 p-4 rounded-xl border border-outline-variant/20">
                {selectedEvent.description}
              </p>
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Participants</p>
                  <div className="flex -space-x-2">
                    {selectedEvent.attendees.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-8 h-8 rounded-full border-2 border-white dark:border-surface overflow-hidden shadow-sm">
                        <Image src={imgUrl} alt={`Participant ${idx + 1}`} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                    {selectedEvent.extraAttendeesCount && (
                      <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-white dark:border-surface flex items-center justify-center text-[10px] font-bold text-on-secondary-container shadow-sm">
                        +{selectedEvent.extraAttendeesCount}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  alert(`Editing event: ${selectedEvent.title}`);
                  closeEventModal();
                }}
                className="flex-1 bg-primary text-white py-3 rounded-full font-bold bouncy pink-glow cursor-pointer"
              >
                Edit Event
              </button>
              <button 
                onClick={() => {
                  if (confirm(`Delete event "${selectedEvent.title}"?`)) {
                    handleDeleteEvent(selectedEvent.id);
                  }
                }}
                className="px-5 py-3 rounded-full font-bold border-2 border-error/30 text-error hover:bg-error/10 transition-all cursor-pointer flex items-center justify-center"
                title="Delete Event"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
              <button 
                onClick={() => alert(`Share link copied for ${selectedEvent.title}!`)}
                className="px-6 py-3 rounded-full font-bold border-2 border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-all cursor-pointer"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Calendar Entry Modal */}
      {isNewEntryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300 p-4">
          <div className="bg-white dark:bg-surface-container-lowest w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-outline-variant/30 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-on-surface">New Calendar Event</h3>
                  <p className="text-xs font-medium text-on-surface-variant">Add an activity to your Aivora schedule</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewEntryModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Project Brainstorm, Gym Routine..." 
                  className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                    Event Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-medium text-on-surface cursor-pointer shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">schedule</span>
                    Time Slot
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-3 py-3 text-xs focus:ring-2 focus:ring-primary/40 outline-none font-medium text-on-surface cursor-pointer shadow-inner"
                    />
                    <span className="text-xs font-bold text-on-surface-variant">to</span>
                    <input 
                      type="time" 
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-3 py-3 text-xs focus:ring-2 focus:ring-primary/40 outline-none font-medium text-on-surface cursor-pointer shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-tertiary">label</span>
                    Category Tag (Custom or Preset)
                  </span>
                  <span className="text-[10px] text-on-surface-variant/70 font-normal lowercase">type below or click preset</span>
                </label>
                <input 
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Type custom tag (e.g. Brainstorm, Doctor)..."
                  className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-medium text-on-surface shadow-inner"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {['Work', 'Health & Wellness', 'Milestone', 'Design', 'Personal', 'Meeting', 'Fitness', 'Study', 'Project', 'Shopping'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        newCategory.toLowerCase() === cat.toLowerCase()
                          ? 'bg-primary text-white border-primary shadow-sm font-black scale-105' 
                          : 'bg-surface-variant/40 dark:bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-variant hover:text-on-surface hover:border-outline-variant'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                    Location
                  </label>
                  <input 
                    type="text" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Conference Room B, Zoom..." 
                    className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-medium text-on-surface shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">palette</span>
                    Color Theme
                  </label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <button 
                      type="button"
                      onClick={() => setNewColor('primary')}
                      className={`w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white transition-transform cursor-pointer shadow-sm ${newColor === 'primary' ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      title="Pink (Primary)"
                    >
                      {newColor === 'primary' && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewColor('secondary')}
                      className={`w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white transition-transform cursor-pointer shadow-sm ${newColor === 'secondary' ? 'scale-125 ring-2 ring-secondary ring-offset-2' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      title="Purple (Secondary)"
                    >
                      {newColor === 'secondary' && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewColor('tertiary')}
                      className={`w-9 h-9 rounded-full bg-tertiary flex items-center justify-center text-white transition-transform cursor-pointer shadow-sm ${newColor === 'tertiary' ? 'scale-125 ring-2 ring-tertiary ring-offset-2' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      title="Blue (Tertiary)"
                    >
                      {newColor === 'tertiary' && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Add notes, agenda items, or link details..." 
                  className="w-full bg-surface-container-low dark:bg-surface-container/30 border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-medium resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                <button 
                  type="button"
                  onClick={() => setIsNewEntryModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold border-2 border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-full font-bold bouncy pink-glow cursor-pointer shadow-lg"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

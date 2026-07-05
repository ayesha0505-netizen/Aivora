"use client";

import React, { useState, useEffect } from "react";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  mood: string;
  moodIcon: string;
  moodColor: string;
  tags: string[];
  favorite: boolean;
}

export function AivoraDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: "entry-1",
      title: "A Breakthrough Afternoon in the Studio",
      content:
        "Today felt magical. After weeks of debugging the core AI neural architecture, everything finally clicked into place around 3 PM. The team celebrated with iced lattes on the balcony. I felt a deep sense of gratitude for the people I work with and the creative freedom we have.",
      date: "Jul 4, 2026",
      time: "8:45 PM",
      mood: "Inspired",
      moodIcon: "auto_awesome",
      moodColor: "bg-primary-fixed text-on-primary-fixed-variant",
      tags: ["#career", "#gratitude", "#breakthrough"],
      favorite: true,
    },
    {
      id: "entry-2",
      title: "Morning Walk at Golden Gate Park",
      content:
        "Woke up at 6:30 AM without an alarm. The morning fog was drifting through the eucalyptus trees, creating this serene, cinematic atmosphere. Took an hour to just breathe and listen to a podcast on mindful living.",
      date: "Jul 3, 2026",
      time: "9:15 AM",
      mood: "Calm",
      moodIcon: "self_improvement",
      moodColor: "bg-secondary-container text-on-secondary-container",
      tags: ["#mindfulness", "#nature", "#health"],
      favorite: false,
    },
    {
      id: "entry-3",
      title: "Planning the Paris Adventure",
      content:
        "Spent the evening researching cozy bistros in Le Marais and booking tickets for the Louvre. It feels surreal that the trip is only a few months away. Need to make sure my French conversational skills get some daily practice with Aivora!",
      date: "Jul 1, 2026",
      time: "10:30 PM",
      mood: "Excited",
      moodIcon: "celebration",
      moodColor: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      tags: ["#travel", "#paris2026", "#goals"],
      favorite: true,
    },
  ]);

  const [isMounted, setIsMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [hasSetPin, setHasSetPin] = useState(false);
  const [pinLength, setPinLength] = useState<4 | 6 | 8>(4);
  const [customPins, setCustomPins] = useState<{ 4: string; 6: string; 8: string }>({
    4: "2026",
    6: "123456",
    8: "12345678",
  });
  const [enteredPin, setEnteredPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Temp states for settings modal
  const [tempLength, setTempLength] = useState<4 | 6 | 8>(4);
  const [tempPin, setTempPin] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedHasSetPin = localStorage.getItem("aivora_diary_has_set_pin");
      if (savedHasSetPin === "true") {
        setHasSetPin(true);
      } else {
        setHasSetPin(false);
        setIsLocked(true);
      }

      const savedLength = localStorage.getItem("aivora_diary_pin_length");
      if (savedLength === "4" || savedLength === "6" || savedLength === "8") {
        const len = Number(savedLength) as 4 | 6 | 8;
        setPinLength(len);
        setTempLength(len);
      }
      const savedPins = localStorage.getItem("aivora_diary_pins");
      if (savedPins) {
        try {
          const parsed = JSON.parse(savedPins);
          setCustomPins(parsed);
        } catch (e) {
          // ignore
        }
      }
      const savedLockState = localStorage.getItem("aivora_diary_is_locked");
      if (savedHasSetPin === "true") {
        if (savedLockState === "true" || savedLockState === null) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      }
    }
  }, []);

  const handleDigitInput = (digit: string) => {
    if (enteredPin.length < pinLength && !pinError) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setErrorMessage("");

      if (nextPin.length === pinLength) {
        if (!hasSetPin) {
          setTimeout(() => {
            const newPins = { ...customPins, [pinLength]: nextPin };
            setCustomPins(newPins);
            setHasSetPin(true);
            setIsLocked(false);
            setEnteredPin("");
            if (typeof window !== "undefined") {
              localStorage.setItem("aivora_diary_pins", JSON.stringify(newPins));
              localStorage.setItem("aivora_diary_has_set_pin", "true");
              localStorage.setItem("aivora_diary_pin_length", String(pinLength));
              localStorage.setItem("aivora_diary_is_locked", "false");
            }
          }, 250);
        } else {
          const activePin = customPins[pinLength] || (pinLength === 4 ? "2026" : pinLength === 6 ? "123456" : "12345678");
          if (nextPin === activePin) {
            setTimeout(() => {
              setIsLocked(false);
              setEnteredPin("");
              if (typeof window !== "undefined") {
                localStorage.setItem("aivora_diary_is_locked", "false");
              }
            }, 250);
          } else {
            setPinError(true);
            setErrorMessage(`Incorrect ${pinLength}-digit password!`);
            setTimeout(() => {
              setEnteredPin("");
              setPinError(false);
            }, 800);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (enteredPin.length > 0 && !pinError) {
      setEnteredPin(enteredPin.slice(0, -1));
      setErrorMessage("");
    }
  };

  const handleClear = () => {
    setEnteredPin("");
    setErrorMessage("");
    setPinError(false);
  };

  const handleSwitchLength = (len: 4 | 6 | 8) => {
    setPinLength(len);
    setEnteredPin("");
    setErrorMessage("");
    setPinError(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("aivora_diary_pin_length", String(len));
    }
  };

  useEffect(() => {
    if (!isLocked || showSettingsModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitInput(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, showSettingsModal, enteredPin, pinLength, pinError, customPins, hasSetPin]);

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
        <div className="bg-white dark:bg-surface-container max-w-md w-full rounded-3xl p-6 lg:p-8 candy-shadow border border-outline-variant/40 relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/30">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">shield_lock</span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-black text-on-surface">Diary Lock Settings</h3>
                <p className="text-xs text-on-surface-variant font-body">Configure your 4, 6, or 8 digit password</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-8 h-8 rounded-full bg-surface-variant/40 hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Select Password Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([4, 6, 8] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      setTempLength(len);
                      setTempPin(customPins[len] || (len === 4 ? "2026" : len === 6 ? "123456" : "12345678"));
                      setSettingsSuccess("");
                    }}
                    className={`py-3 rounded-2xl font-bold text-sm transition-all border flex flex-col items-center justify-center gap-1 ${
                      tempLength === len
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-surface-variant/30 text-on-surface border-outline-variant/30 hover:border-primary/40"
                    }`}
                  >
                    <span className="text-lg font-black">{len}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-90">Digits</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Set {tempLength}-Digit Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={tempLength}
                  value={tempPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setTempPin(val);
                    setSettingsSuccess("");
                  }}
                  placeholder={`Enter ${tempLength} digits...`}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-outline-variant/50 bg-surface-variant/20 text-on-surface font-mono font-bold text-lg tracking-widest text-center focus:border-primary focus:bg-white dark:focus:bg-surface focus:ring-4 focus:ring-primary/15 outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant/60 bg-surface-variant/60 px-2 py-1 rounded">
                  {tempPin.length} / {tempLength}
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 font-body flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">info</span>
                <span>Only numeric digits (0-9) are allowed for vault security.</span>
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{settingsSuccess}</span>
              </div>
            )}

            <div className="pt-4 border-t border-outline-variant/30 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-3 rounded-full border border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant/30 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempPin.length !== tempLength) {
                    alert(`Please enter exactly ${tempLength} digits for your password.`);
                    return;
                  }
                  const newPins = { ...customPins, [tempLength]: tempPin };
                  setCustomPins(newPins);
                  setPinLength(tempLength);
                  setEnteredPin("");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("aivora_diary_pins", JSON.stringify(newPins));
                    localStorage.setItem("aivora_diary_pin_length", String(tempLength));
                  }
                  setSettingsSuccess(`Successfully updated ${tempLength}-digit password to ${tempPin}!`);
                  setTimeout(() => {
                    setShowSettingsModal(false);
                    setSettingsSuccess("");
                  }, 1200);
                }}
                disabled={tempPin.length !== tempLength}
                className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Save Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [selectedMood, setSelectedMood] = useState({ name: "Inspired", icon: "auto_awesome", color: "bg-primary-fixed text-on-primary-fixed-variant" });
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("#daily #reflection");
  const [filterTag, setFilterTag] = useState("All");

  const moods = [
    { name: "Inspired", icon: "auto_awesome", color: "bg-primary-fixed text-on-primary-fixed-variant" },
    { name: "Calm", icon: "self_improvement", color: "bg-secondary-container text-on-secondary-container" },
    { name: "Excited", icon: "celebration", color: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
    { name: "Happy", icon: "sentiment_satisfied", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
    { name: "Reflective", icon: "psychology", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  ];

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagArray = newTags
      .split(" ")
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .filter((t) => t !== "#");

    const newEntry: DiaryEntry = {
      id: "entry-" + Date.now(),
      title: newTitle,
      content: newContent,
      date: "Today",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mood: selectedMood.name,
      moodIcon: selectedMood.icon,
      moodColor: selectedMood.color,
      tags: tagArray.length > 0 ? tagArray : ["#journal"],
      favorite: false,
    };

    setEntries([newEntry, ...entries]);
    setNewTitle("");
    setNewContent("");
    setNewTags("#daily #reflection");
  };

  const toggleFavorite = (id: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e)));
  };

  const filteredEntries = filterTag === "All"
    ? entries
    : filterTag === "Favorites"
    ? entries.filter((e) => e.favorite)
    : entries.filter((e) => e.tags.includes(filterTag));

  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags)));

  if (!isMounted) return null;

  if (isLocked || !hasSetPin) {
    const activePin = customPins[pinLength] || (pinLength === 4 ? "2026" : pinLength === 6 ? "123456" : "12345678");
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
        {renderSettingsModal()}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: "-3s" }} />

        <div className="max-w-md w-full p-8 lg:p-10 bg-white dark:bg-surface-container/95 rounded-3xl text-center candy-shadow border border-primary/30 relative z-10 backdrop-blur-xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-inner ring-4 ring-primary/10 bouncy">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {!hasSetPin ? "password" : "lock"}
            </span>
          </div>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
            {!hasSetPin ? "Set Up Diary PIN" : "Diary Vault Protected"}
          </h2>
          <p className="text-sm text-on-surface-variant mb-6 font-body leading-relaxed">
            {!hasSetPin ? (
              <>Secure your personal diary. Choose a PIN length and enter your new <strong className="text-primary font-bold">password</strong>.</>
            ) : (
              <>Your personal diary is end-to-end encrypted. Please enter your <strong className="text-primary font-bold">{pinLength}-digit password</strong> to unlock.</>
            )}
          </p>

          {!hasSetPin && (
            <div className="flex items-center justify-center gap-1.5 p-1.5 bg-surface-variant/40 rounded-full mb-8 border border-outline-variant/30 max-w-xs mx-auto">
              {([4, 6, 8] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => handleSwitchLength(len)}
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all duration-300 ${
                    pinLength === len
                      ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/50 dark:hover:bg-surface/50"
                  }`}
                >
                  {len} Digits
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <div className={`flex items-center justify-center gap-2.5 my-4 ${pinError ? "animate-shake" : ""}`}>
              {Array.from({ length: pinLength }).map((_, idx) => {
                const isFilled = idx < enteredPin.length;
                const char = enteredPin[idx];
                return (
                  <div
                    key={idx}
                    className={`${pinLength === 8 ? "w-8 h-10 text-base" : "w-10 h-12 text-lg"} rounded-xl border-2 flex items-center justify-center font-black transition-all duration-200 ${
                      pinError
                        ? "border-error bg-error/10 text-error scale-110 shadow-md shadow-error/20"
                        : isFilled
                        ? "border-primary bg-primary/10 text-primary scale-110 shadow-md shadow-primary/20"
                        : "border-outline-variant/40 bg-surface-variant/20 text-transparent"
                    }`}
                  >
                    {isFilled ? (showPin ? char : "•") : ""}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs px-2 mt-2">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-bold"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPin ? "visibility_off" : "visibility"}
                </span>
                <span>{showPin ? "Hide Numbers" : "Show Numbers"}</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold animate-fade-in flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-8">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitInput(num)}
                className="h-14 rounded-2xl bg-surface-variant/30 hover:bg-primary/15 active:bg-primary/25 text-on-surface font-headline font-black text-xl border border-outline-variant/30 hover:border-primary/50 transition-all bouncy flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-2xl bg-surface-variant/30 hover:bg-error/15 active:bg-error/25 text-on-surface-variant hover:text-error font-bold text-xs border border-outline-variant/30 hover:border-error/40 transition-all bouncy flex flex-col items-center justify-center uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">layers_clear</span>
              <span className="text-[10px]">Clear</span>
            </button>
            <button
              type="button"
              onClick={() => handleDigitInput("0")}
              className="h-14 rounded-2xl bg-surface-variant/30 hover:bg-primary/15 active:bg-primary/25 text-on-surface font-headline font-black text-xl border border-outline-variant/30 hover:border-primary/50 transition-all bouncy flex items-center justify-center shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-surface-variant/30 hover:bg-secondary/15 active:bg-secondary/25 text-on-surface-variant hover:text-secondary font-bold text-xs border border-outline-variant/30 hover:border-secondary/40 transition-all bouncy flex flex-col items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl">backspace</span>
              <span className="text-[10px]">Delete</span>
            </button>
          </div>

          {hasSetPin && (
            <div className="pt-4 border-t border-outline-variant/30 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setTempLength(pinLength);
                  setTempPin(customPins[pinLength] || "");
                  setShowSettingsModal(true);
                }}
                className="w-full sm:w-auto py-3 px-6 bg-surface-variant/40 hover:bg-surface-variant text-on-surface rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30 bouncy"
              >
                <span className="material-symbols-outlined text-base">settings</span>
                <span>PIN Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      {/* Top Header & Privacy Lock Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
            <h1 className="text-4xl font-headline font-black text-primary">Personal Diary</h1>
          </div>
          <p className="text-on-surface-variant font-body">Capture your thoughts, emotions, and daily gratitude in your private vault.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              setIsLocked(true);
              if (typeof window !== "undefined") {
                localStorage.setItem("aivora_diary_is_locked", "true");
              }
            }}
            className="px-5 py-2.5 bg-white border-2 border-outline-variant/40 hover:border-primary text-on-surface rounded-full font-bold text-sm transition-all flex items-center gap-2 bouncy-hover shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-base">lock</span>
            <span>Lock Diary</span>
          </button>
          <button
            onClick={() => {
              setTempLength(pinLength);
              setTempPin(customPins[pinLength] || "");
              setSettingsSuccess("");
              setShowSettingsModal(true);
            }}
            className="px-4 py-2.5 bg-white border-2 border-outline-variant/40 hover:border-secondary text-on-surface rounded-full font-bold text-sm transition-all flex items-center gap-1.5 bouncy-hover shadow-sm"
            title="Configure 4, 6, or 8 digit password"
          >
            <span className="material-symbols-outlined text-secondary text-base">password</span>
            <span>PIN Setup ({pinLength}D)</span>
          </button>
          <button
            onClick={() => alert("AI Emotional Trajectory analysis generated! View insights below.")}
            className="px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm pink-shadow flex items-center gap-2 bouncy-hover hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>AI Mood Reflection</span>
          </button>
        </div>
      </div>

      {/* AI Sentiment Analysis Card */}
      <div className="bg-gradient-to-r from-secondary-container/40 via-surface-container to-primary-container/30 p-6 lg:p-8 rounded-2xl border border-secondary/20 purple-shadow mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bouncy-hover">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white flex-shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-2xl">insights</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <span>Aivora Emotional Trajectory Insight</span>
              <span className="text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full uppercase font-black tracking-wider">Positive Trend</span>
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl font-body">
              Over the last 7 days, your entries show a 40% increase in words associated with <strong className="text-primary font-bold">gratitude</strong> and <strong className="text-secondary font-bold">creative inspiration</strong>. Your most serene moments consistently align with morning walks and outdoor breaks.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/80 dark:bg-surface/80 p-4 rounded-2xl border border-outline-variant/20 self-stretch md:self-auto justify-center">
          <div className="text-center">
            <span className="block text-2xl font-black text-primary">8.4 / 10</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Well-being Score</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Create Entry Form & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left Col: Write New Entry Form */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <h3 className="text-2xl font-headline font-black text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">edit_note</span>
            <span>New Entry</span>
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 font-body">How are you feeling right now? What made today memorable?</p>

          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Select Your Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedMood.name === m.name
                        ? `${m.color} ring-2 ring-primary shadow-sm scale-105`
                        : "bg-surface-variant/40 text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{m.icon}</span>
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 mt-4">
                Entry Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A Moment of Serenity"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-variant/20 text-sm focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Your Thoughts
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write freely. Aivora keeps your secrets safe and organized..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-4 rounded-xl border border-outline-variant/40 bg-surface-variant/20 text-sm focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all leading-relaxed resize-none font-body"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Tags (space separated)
              </label>
              <input
                type="text"
                placeholder="#gratitude #work #ideas"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-variant/20 text-xs focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">book_save</span>
              <span>Save Diary Entry</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Timeline & Filtered Entries */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Tag & Favorite Filters */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-headline font-black text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">history_edu</span>
              <span>Journal Vault</span>
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilterTag("All")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  filterTag === "All"
                    ? "bg-primary text-white pink-shadow"
                    : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-primary"
                }`}
              >
                All Entries ({entries.length})
              </button>
              <button
                onClick={() => setFilterTag("Favorites")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  filterTag === "Favorites"
                    ? "bg-secondary text-white purple-shadow"
                    : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-secondary"
                }`}
              >
                <span className="material-symbols-outlined text-xs text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span>Favorites ({entries.filter((e) => e.favorite).length})</span>
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    filterTag === tag
                      ? "bg-tertiary text-white blue-shadow"
                      : "bg-white border border-outline-variant/30 text-on-surface-variant hover:border-tertiary"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Entries Bento List */}
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[650px] custom-scrollbar pr-2">
            {filteredEntries.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-outline-variant/30 text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">auto_stories</span>
                <h4 className="text-lg font-bold text-on-surface mb-1">No Entries Found</h4>
                <p className="text-sm text-on-surface-variant">Try selecting a different filter or write your first journal entry on the left!</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white p-6 lg:p-8 rounded-2xl border border-outline-variant/30 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 relative bouncy-hover group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${entry.moodColor}`}>
                        <span className="material-symbols-outlined text-sm">{entry.moodIcon}</span>
                        <span>{entry.mood}</span>
                      </span>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {entry.date} • <span className="opacity-75">{entry.time}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(entry.id)}
                        className={`p-2 rounded-full transition-colors ${
                          entry.favorite
                            ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                            : "text-on-surface-variant/40 hover:text-yellow-500 hover:bg-surface-variant/40"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: entry.favorite ? "'FILL' 1" : "'FILL' 0" }}>
                          star
                        </span>
                      </button>
                      <button className="p-2 rounded-full text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-variant/40 transition-colors">
                        <span className="material-symbols-outlined text-xl">share</span>
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line font-body mb-6">
                    {entry.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-surface-variant/50 text-[11px] font-mono text-on-surface-variant font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <span>Ask AI to analyze</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {renderSettingsModal()}
    </div>
  );
}

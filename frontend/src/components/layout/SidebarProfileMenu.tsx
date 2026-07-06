"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function SidebarProfileMenu() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Profile state
  const { user, logout } = useAuth();

  const [fullName, setFullName] = useState("Guest User");
  const [username, setUsername] = useState("guest");
  const [bio, setBio] = useState(
    "AI enthusiast. Living at the intersection of productivity and playful design."
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(user.displayName ? user.displayName : "Guest User");
      setUsername(user.email ? user.email.split('@')[0] : "guest");
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);
    showToast("Profile and username updated successfully!");
  };

  return (
    <div className="relative mt-auto pt-4 border-t border-outline-variant/30" ref={menuRef}>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Popup Dropdown Menu */}
      {menuOpen && (
        <div className="absolute bottom-full mb-3 left-0 w-full min-w-[240px] bg-white dark:bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2.5 border-b border-outline-variant/20 mb-1">
            <p className="text-sm font-bold text-on-surface truncate">{fullName}</p>
            <p className="text-xs text-on-surface-variant/80 truncate">@{username} • PRO Plan</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                setModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-primary/10 hover:text-primary transition-all text-left cursor-pointer group"
            >
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">person</span>
              <span>Personalization (My Profile)</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-primary/10 hover:text-primary transition-all text-left cursor-pointer group"
            >
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">settings</span>
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/support");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-primary/10 hover:text-primary transition-all text-left cursor-pointer group"
            >
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">help</span>
              <span>Help &amp; Support</span>
            </button>

            <div className="border-t border-outline-variant/20 my-1 pt-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  router.push("/");
                  showToast("Logged out of Aivora session");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all text-left cursor-pointer group"
              >
                <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">logout</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar User Profile Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl group cursor-pointer transition-all ${menuOpen ? "bg-primary/15 ring-2 ring-primary/30" : "hover:bg-surface-variant/50"
          }`}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container pink-glow flex-shrink-0 group-hover:scale-105 transition-transform">
          <Image
            className="object-cover"
            fill
            alt={fullName}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvY6bjQSK7q7-zakJI3meU7o9ayqMh9ogRvIgyZAhyS3Wt3uNTKiQx5l7ht4tsIWrpBOW61w3l5WLFHTIDEeVwBrKBB8haw3VTWUvb6UWRj68i8UVNEP2XN4QpqVq13KZgAnwSOD4fM3Lp7snQ5EzqbtvjewfwyKeFdAf79V8nV9LN551PDxzNN_xa_wEQ29YUlUaMGkaHtw6NOzTmZ8uS7U4tNVmK0MBccyZDUylKAda1NbP0cJHt3g"
            unoptimized
          />
        </div>
        <div className="text-left overflow-hidden flex-1">
          <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{fullName}</p>
          <p className="text-[10px] text-primary font-medium truncate">@{username}</p>
        </div>
        <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}>
          unfold_more
        </span>
      </button>

      {/* Personalization / Profile Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-surface-container-high rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/20 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
              <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person_edit</span>
                  Edit Profile
                </h3>
                <p className="text-xs text-on-surface-variant">Personalization and identity settings</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-variant/50 hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar section */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md relative">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvY6bjQSK7q7-zakJI3meU7o9ayqMh9ogRvIgyZAhyS3Wt3uNTKiQx5l7ht4tsIWrpBOW61w3l5WLFHTIDEeVwBrKBB8haw3VTWUvb6UWRj68i8UVNEP2XN4QpqVq13KZgAnwSOD4fM3Lp7snQ5EzqbtvjewfwyKeFdAf79V8nV9LN551PDxzNN_xa_wEQ29YUlUaMGkaHtw6NOzTmZ8uS7U4tNVmK0MBccyZDUylKAda1NbP0cJHt3g"
                      alt={fullName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("Avatar upload feature coming soon")}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                    title="Change Avatar"
                  >
                    <span className="material-symbols-outlined text-xs">photo_camera</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-sm outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-sm outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-sm outline-none transition-all resize-none"
                />
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-variant/50 rounded-full text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

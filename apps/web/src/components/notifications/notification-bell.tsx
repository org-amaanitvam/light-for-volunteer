"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Check, ExternalLink, Sparkles } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { API_BASE_URL, api } from "@/lib/api";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
};

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [page, count] = await Promise.all([
      api.request<{ notifications: NotificationItem[] }>("/notifications?page=1&limit=20"),
      api.request<{ count: number }>("/notifications/unread-count"),
    ]);
    setNotifications(page.notifications);
    setUnreadCount(count.count);
  }, []);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
      return;
    }
    let active = true;
    const loadTimer = window.setTimeout(() => {
      void load().catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Notifications are unavailable.");
      });
    }, 0);
    const token = api.getAccessToken();
    if (!token || !API_BASE_URL) return () => { active = false; window.clearTimeout(loadTimer); };
    const origin = API_BASE_URL.replace(/\/api\/?$/, "");
    const socket: Socket = io(`${origin}/ws`, { auth: { token }, transports: ["websocket", "polling"] });
    socket.on("notification", (item: NotificationItem) => {
      if (!active) return;
      setNotifications((previous) => [item, ...previous.filter((entry) => entry.id !== item.id)].slice(0, 20));
      if (!item.is_read) setUnreadCount((count) => count + 1);
    });
    return () => { active = false; window.clearTimeout(loadTimer); socket.disconnect(); };
  }, [user, load]);

  const unreadIds = useMemo(() => new Set(notifications.filter((item) => !item.is_read).map((item) => item.id)), [notifications]);

  async function markOneAsRead(id: string) {
    if (!unreadIds.has(id)) return;
    try {
      await api.request(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not mark notification read."); }
  }

  async function markAllAsRead() {
    try {
      await api.request("/notifications/read-all", { method: "PATCH" });
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not mark notifications read."); }
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={() => { setIsOpen((open) => !open); if (!isOpen) void load().catch(() => undefined); }} className="relative rounded-full p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#38bdf8]" aria-label="View notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {isOpen && <>
        <button className="fixed inset-0 z-40 cursor-default" aria-label="Close notifications" onClick={() => setIsOpen(false)} />
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-sky-100 bg-white p-4 shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-800">Notifications</span>{unreadCount > 0 && <Badge variant="secondary" className="bg-sky-100 text-xs text-sky-800">{unreadCount} new</Badge>}</div>
            {unreadCount > 0 && <button onClick={() => void markAllAsRead()} className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"><Check className="h-3.5 w-3.5" /> Mark all read</button>}
          </div>
          {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
          <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {notifications.map((item) => {
              const destination = item.reference_type === "opportunity" && item.reference_id ? `/opportunities/${item.reference_id}` : null;
              const content = <div className={`rounded-xl p-2.5 transition-colors ${item.is_read ? "opacity-75 hover:bg-slate-50" : "bg-sky-50/70 hover:bg-sky-50"}`}>
                <div className="flex items-start justify-between gap-2"><p className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">{item.type === "badge_awarded" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}{item.title}</p><span className="whitespace-nowrap text-[10px] text-slate-400">{relativeTime(item.created_at)}</span></div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.body}</p>
              </div>;
              return destination ? <Link key={item.id} href={destination} onClick={() => { void markOneAsRead(item.id); setIsOpen(false); }}>{content}</Link> : <button key={item.id} onClick={() => void markOneAsRead(item.id)} className="block w-full text-left">{content}</button>;
            })}
            {notifications.length === 0 && !error && <p className="p-5 text-center text-xs text-slate-500">You’re all caught up.</p>}
          </div>
          <div className="mt-2 border-t border-sky-100 pt-3 text-center"><span className="inline-flex items-center gap-1 text-xs text-slate-400">Live updates enabled <ExternalLink className="h-3 w-3" /></span></div>
        </div>
      </>}
    </div>
  );
}

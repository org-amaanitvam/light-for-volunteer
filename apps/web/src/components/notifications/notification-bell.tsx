"use client";

import React, { useState } from "react";
import { Bell, Check, Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "opportunity" | "application" | "system" | "badge";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Application Accepted!",
    message: "Green Earth Trust accepted your volunteer application for 'Tree Plantation Drive'.",
    time: "10m ago",
    read: false,
    type: "application",
  },
  {
    id: "2",
    title: "New Matching Opportunity",
    message: "A new teaching internship matching your 'Education' skill was just posted.",
    time: "2h ago",
    read: false,
    type: "opportunity",
  },
  {
    id: "3",
    title: "Badge Unlocked: Community Champion",
    message: "Congratulations! You completed 25+ volunteer hours this month.",
    time: "1d ago",
    read: true,
    type: "badge",
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Card */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-sky-100 bg-white/95 p-4 shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-sky-100 text-sky-800 text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium transition"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="mt-3 divide-y divide-sky-50 max-h-72 overflow-y-auto space-y-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                    item.read
                      ? "opacity-75 hover:bg-slate-50"
                      : "bg-sky-50/60 hover:bg-sky-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      {item.type === "badge" && <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />}
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-2 border-t border-sky-100 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-sky-600 hover:text-sky-700 h-8"
                onClick={() => setIsOpen(false)}
              >
                View all notifications <ExternalLink className="w-3 h-3 ml-1.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { MessageSquare, Send, X, Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { API_BASE_URL, api } from "@/lib/api";

type ChatMessage = { id: string; text: string; sent_at: string; sender: { id: string; name: string } };
type ChatThread = { thread: { id: string; participants?: { user?: { id: string; name: string } }[] }; lastMessage: ChatMessage | null };

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatWindow() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const selectedThreadRef = useRef<string | null>(null);

  useEffect(() => { selectedThreadRef.current = selected?.thread.id ?? null; }, [selected?.thread.id]);

  const loadThreads = useCallback(async () => {
    const items = await api.request<ChatThread[]>("/messaging/threads");
    setThreads(items);
    return items;
  }, []);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setThreads([]); setSelected(null); setMessages([]); setSocket(null);
      });
      return;
    }
    let active = true;
    const openConversation = (event: Event) => {
      const recipient = (event as CustomEvent<{ recipientId?: string }>).detail?.recipientId;
      if (!recipient || recipient === user.id) return;
      setIsOpen(true);
      setError("");
      void api.request<ChatThread["thread"]>("/messaging/threads", { method: "POST", body: JSON.stringify({ receiverId: recipient }) })
        .then((thread) => {
          if (!active) return;
          const item = { thread, lastMessage: null };
          setThreads((items) => [item, ...items.filter((entry) => entry.thread.id !== thread.id)]);
          setSelected(item);
        })
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not open this conversation."));
    };
    window.addEventListener("lfv:message-user", openConversation);
    const loadTimer = window.setTimeout(() => {
      void loadThreads().then((items) => {
        if (active && items.length && !selectedThreadRef.current) setSelected(items[0]);
      }).catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load conversations.");
      });
    }, 0);
    const token = api.getAccessToken();
    if (!token || !API_BASE_URL) return () => { active = false; window.clearTimeout(loadTimer); window.removeEventListener("lfv:message-user", openConversation); };
    const origin = API_BASE_URL.replace(/\/api\/?$/, "");
    const connection = io(`${origin}/ws`, { auth: { token }, transports: ["websocket", "polling"] });
    connection.on("connect", () => {
      if (selectedThreadRef.current) connection.emit("join_thread", { threadId: selectedThreadRef.current });
    });
    connection.on("connect_error", () => { if (active) setError("Live chat is disconnected. You can still send messages using the fallback."); });
    connection.on("new_message", (incoming: ChatMessage & { thread_id?: string }) => {
      if (!active || incoming.thread_id !== selectedThreadRef.current) return;
      setMessages((items) => items.some((item) => item.id === incoming.id) ? items : [...items, incoming]);
      void loadThreads().catch(() => undefined);
    });
    setSocket(connection);
    return () => { active = false; window.clearTimeout(loadTimer); window.removeEventListener("lfv:message-user", openConversation); connection.disconnect(); setSocket(null); };
  // Recreate the socket only when auth changes; selected thread is checked in its own effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadThreads]);

  useEffect(() => {
    if (!selected) {
      queueMicrotask(() => setMessages([]));
      return;
    }
    let active = true;
    void api.request<{ messages: ChatMessage[] }>(`/messaging/threads/${selected.thread.id}/messages?page=1&limit=50`).then((page) => {
      if (active) setMessages([...page.messages].reverse());
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load message history."); });
    if (socket?.connected) socket.emit("join_thread", { threadId: selected.thread.id });
    return () => { active = false; if (socket?.connected) socket.emit("leave_thread", { threadId: selected.thread.id }); };
  }, [selected?.thread.id, socket]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  async function startConversation(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const result = await api.request<ChatThread["thread"]>("/messaging/threads", { method: "POST", body: JSON.stringify({ receiverId: recipientId.trim() }) });
      const thread = { thread: result, lastMessage: null };
      setThreads((items) => [thread, ...items.filter((item) => item.thread.id !== result.id)]);
      setSelected(thread); setRecipientId("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not start this conversation."); }
    finally { setBusy(false); }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    const text = message.trim(); setMessage(""); setError("");
    if (socket?.connected) {
      socket.timeout(5000).emit("send_message", { threadId: selected.thread.id, text }, (timeout: Error | null, result?: { ok: boolean }) => {
        if (timeout || !result?.ok) setError("Message could not be confirmed. Check the conversation before retrying.");
      });
    } else {
      try {
        const saved = await api.request<ChatMessage>("/messaging/messages", { method: "POST", body: JSON.stringify({ threadId: selected.thread.id, text }) });
        setMessages((items) => [...items, saved]);
        await loadThreads();
      } catch (reason) { setMessage(text); setError(reason instanceof Error ? reason.message : "Could not send message."); }
    }
  }

  if (!user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-sky-600 hover:to-cyan-600" aria-label="Open messages"><MessageSquare className="h-5 w-5" /> Messages</button>}
      {isOpen && <section className="flex h-[min(600px,80vh)] w-[min(760px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl" aria-label="Messages">
        <aside className={`${selected ? "hidden sm:flex" : "flex"} w-full shrink-0 flex-col border-r border-sky-100 bg-slate-50 sm:w-64`}>
          <header className="flex items-center justify-between border-b border-sky-100 bg-white px-4 py-3"><div><h2 className="font-bold text-slate-900">Messages</h2><p className="text-[11px] text-slate-500">Saved and synced live</p></div><button onClick={() => setIsOpen(false)} aria-label="Close messages"><X className="h-5 w-5" /></button></header>
          <form onSubmit={(event) => void startConversation(event)} className="space-y-2 border-b border-sky-100 p-3"><label className="block text-[11px] font-semibold text-slate-600" htmlFor="recipient-user-id">Start conversation (user ID)</label><div className="flex gap-1.5"><input id="recipient-user-id" value={recipientId} onChange={(event) => setRecipientId(event.target.value)} placeholder="Paste a user UUID" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-2 text-xs outline-none focus:border-sky-400" /><button disabled={busy || !recipientId.trim()} className="rounded-lg bg-sky-500 px-2 text-white disabled:opacity-50" aria-label="Start conversation"><Plus className="h-4 w-4" /></button></div></form>
          <div className="flex-1 overflow-y-auto">{threads.map((item) => { const other = item.thread.participants?.map((entry) => entry.user).find((person) => person?.id !== user.id); return <button key={item.thread.id} onClick={() => setSelected(item)} className={`w-full border-b border-slate-100 p-3 text-left hover:bg-sky-50 ${selected?.thread.id === item.thread.id ? "bg-sky-50" : "bg-white"}`}><p className="truncate text-sm font-semibold text-slate-800">{other?.name ?? "Conversation"}</p><p className="mt-1 truncate text-xs text-slate-500">{item.lastMessage?.text ?? "No messages yet"}</p></button>; })}{threads.length === 0 && <p className="p-4 text-xs text-slate-500">No conversations yet. Start one with a user ID.</p>}</div>
        </aside>
        <div className={`${selected ? "flex" : "hidden sm:flex"} min-w-0 flex-1 flex-col`}>
          <header className="flex items-center justify-between border-b border-sky-100 px-4 py-3"><div className="flex items-center gap-2">{selected && <button className="sm:hidden" onClick={() => setSelected(null)} aria-label="Back to conversations"><ArrowLeft className="h-4 w-4" /></button>}<div><h2 className="font-bold text-slate-900">{selected?.thread.participants?.map((entry) => entry.user).find((person) => person?.id !== user.id)?.name ?? "Select a conversation"}</h2><p className="text-[11px] text-slate-500">{socket?.connected ? "Live" : "Connecting…"}</p></div></div><button onClick={() => setIsOpen(false)} aria-label="Close messages"><X className="h-5 w-5" /></button></header>
          {error && <p role="status" className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">{messages.map((item) => <div key={item.id} className={`flex flex-col ${item.sender.id === user.id ? "items-end" : "items-start"}`}><span className="mb-1 text-[10px] text-slate-400">{item.sender.id === user.id ? "You" : item.sender.name} · {formatTime(item.sent_at)}</span><p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${item.sender.id === user.id ? "rounded-br-sm bg-sky-500 text-white" : "rounded-bl-sm border border-sky-100 bg-white text-slate-700"}`}>{item.text}</p></div>)}{selected && messages.length === 0 && <p className="mt-8 text-center text-xs text-slate-400">Start the conversation with a message.</p>}<div ref={endRef} /></div>
          <form onSubmit={(event) => void sendMessage(event)} className="flex gap-2 border-t border-sky-100 bg-white p-3"><input value={message} onChange={(event) => setMessage(event.target.value)} disabled={!selected} maxLength={5000} placeholder={selected ? "Write a message…" : "Choose a conversation"} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 disabled:bg-slate-50" /><button disabled={!selected || !message.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white disabled:opacity-50" aria-label="Send message"><Send className="h-4 w-4" /></button></form>
        </div>
      </section>}
    </div>
  );
}

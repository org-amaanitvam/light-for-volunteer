"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, ShieldCheck, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  sender: "user" | "support" | "coordinator";
  senderName: string;
  text: string;
  time: string;
}

export function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "support",
      senderName: "Light Volunteer Guide",
      text: "Hello! Welcome to Light For Volunteer. How can we help you explore volunteering opportunities or post a cause today?",
      time: "Just now",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    // Simulated helpful responder for social impact & volunteering guidance
    setTimeout(() => {
      let replyText =
        "Thank you for reaching out! You can browse active social impact causes in Education, Environment, and Health, or connect directly with registered verified NGOs.";
      
      const lower = userMsg.text.toLowerCase();
      if (lower.includes("intern") || lower.includes("internship")) {
        replyText =
          "We have structured volunteer internships providing verified completion certificates and mentorship badges. Check out our Opportunities page!";
      } else if (lower.includes("ngo") || lower.includes("organisation") || lower.includes("register")) {
        replyText =
          "Social impact organisations and NGOs can sign up with their 80G/12A or registration ID to post verified volunteering drives.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "coordinator",
          senderName: "Amaanitvam Impact Coordinator",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-full shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-medium text-sm"
          aria-label="Open support chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Ask Volunteer Support</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`w-[360px] sm:w-[400px] rounded-2xl border border-sky-200 bg-white shadow-2xl backdrop-blur-md flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized ? "h-14" : "h-[540px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-3.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  Volunteer Chat Assistant
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
                </h4>
                <p className="text-[11px] text-sky-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Online | Light For Volunteer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-white/20 text-sky-100 transition"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-sky-100 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Messages) */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
                <div className="text-center my-2">
                  <Badge variant="outline" className="text-[10px] text-slate-500 bg-white">
                    Verified Amaanitvam Volunteer Network
                  </Badge>
                </div>

                {messages.map((m) => {
                  const isUser = m.sender === "user";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {m.senderName}
                        </span>
                        <span className="text-[9px] text-slate-400">{m.time}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? "bg-sky-500 text-white rounded-br-none shadow-sm"
                            : "bg-white text-slate-700 border border-sky-100 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-sky-100 flex items-center gap-2"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question or type a message..."
                  className="text-xs h-10 border-sky-100 focus-visible:ring-sky-400"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0 bg-sky-500 hover:bg-sky-600 text-white rounded-xl"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatRooms, useChatMessages, useSendMessage } from "@/features/chat/services";
import { useAuth } from "@/features/auth/context/auth-context";

export function TeacherChat() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  // Mobile: show sidebar (true) or chat area (false)
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { data: rooms, isLoading: roomsLoading } = useChatRooms();

  // Set default active room
  useEffect(() => {
    if (rooms && rooms.length > 0 && !activeRoomId) {
      setActiveRoomId(rooms[0].id);
      setShowSidebar(false);
    }
  }, [rooms, activeRoomId]);

  const { data: activeChatData, isLoading: messagesLoading } = useChatMessages(activeRoomId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const activeRoom = activeChatData?.room;
  const messages = activeChatData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setShowSidebar(false); // on mobile, switch to chat view
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !activeRoomId) return;

    sendMessage(
      { courseId: activeRoomId, content: message },
      {
        onSuccess: () => setMessage(""),
        onError: (err) => alert(`Failed to send message: ${err.message}`),
      }
    );
  };

  return (
    // Full-height flex column — takes the parent main's remaining height
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full min-h-0">
      <PageHeader
        title="Classroom Chat"
        description="Communicate with students and staff members in real-time."
      />

      {/* Chat container — fills all remaining vertical space */}
      <div className="flex flex-1 min-h-0 rounded-xl border border-indigo-100 shadow-sm bg-white overflow-hidden mt-3">

        {/* ── Left Sidebar ── */}
        <div
          className={cn(
            "flex flex-col border-r border-slate-100 bg-slate-50/60 shrink-0",
            // Desktop: always visible at fixed width
            "md:flex md:w-64 lg:w-72",
            // Mobile: toggle between sidebar and chat
            showSidebar ? "flex w-full" : "hidden"
          )}
        >
          {/* Sidebar header */}
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100 bg-white shrink-0">
            <MessageSquare className="h-4 w-4 text-indigo-600 shrink-0" />
            <h2 className="font-semibold text-sm text-slate-800">Conversations</h2>
          </div>

          {/* Room list — scrollable */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {roomsLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            ) : rooms && rooms.length > 0 ? (
              rooms.map((room) => {
                const isActive = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "hover:bg-white hover:shadow-sm text-slate-700"
                    )}
                  >
                    {/* Room avatar */}
                    <div className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-full shrink-0 text-sm font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                    )}>
                      {room.title.charAt(0).toUpperCase()}
                    </div>
                    {/* Room info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-semibold text-sm truncate",
                        isActive ? "text-white" : "text-slate-800"
                      )}>
                        {room.title}
                      </p>
                      <p className={cn(
                        "text-xs truncate mt-0.5",
                        isActive ? "text-indigo-100" : "text-slate-500"
                      )}>
                        {room.memberCount} members
                      </p>
                    </div>
                    {/* Active dot */}
                    {isActive && (
                      <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center p-6 text-sm text-slate-400">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Chat Area ── */}
        <div
          className={cn(
            "flex flex-col flex-1 min-w-0 min-h-0",
            showSidebar ? "hidden md:flex" : "flex"
          )}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
            {/* Mobile back button */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>

            {activeRoomId ? (
              <>
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm shrink-0">
                  {activeRoom?.title?.charAt(0).toUpperCase() ?? <Users className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 text-sm truncate">
                    {activeRoom?.title ?? "Loading…"}
                  </h2>
                  {activeRoom && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      {activeRoom.memberCount} Participants
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Select a conversation</p>
            )}
          </div>

          {/* Messages — scrollable area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/40 px-4 py-4 min-h-0">
            {!activeRoomId ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                Select a classroom from the sidebar to start chatting.
              </div>
            ) : messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                {messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  const isTeacher = msg.sender.role === "teacher";

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "flex gap-2.5 max-w-[75%]",
                        isMe ? "flex-row-reverse" : "flex-row"
                      )}>
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 mt-1 shrink-0 border shadow-sm">
                          {msg.sender.profilePhotoUrl && (
                            <AvatarImage src={msg.sender.profilePhotoUrl} />
                          )}
                          <AvatarFallback className={cn(
                            "text-[11px] font-semibold text-white",
                            isMe ? "bg-indigo-600" : isTeacher ? "bg-amber-500" : "bg-slate-400"
                          )}>
                            {msg.sender.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Bubble */}
                        <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                          {/* Sender name + time */}
                          <span className="text-[11px] text-slate-400 mb-1 px-1">
                            {isMe ? "You" : msg.sender.name}
                            {isTeacher && !isMe ? " · Teacher" : ""}
                            {" · "}
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <div className={cn(
                            "px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-sm"
                              : isTeacher
                              ? "bg-amber-50 border border-amber-100 text-amber-900 rounded-tl-sm"
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                          )}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 max-w-3xl mx-auto"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={!activeRoomId ? "Select a room first…" : "Type your message…"}
                disabled={!activeRoomId || isSending}
                className="flex-1 rounded-full border-slate-200 bg-slate-50 hover:bg-slate-100 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all h-10 px-4 text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || !activeRoomId || isSending}
                className="rounded-full h-10 w-10 bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all shrink-0"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

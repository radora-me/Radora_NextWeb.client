"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatRooms, useChatMessages, useSendMessage } from "@/features/chat/services";
import { useAuth } from "@/features/auth/context/auth-context";

export default function TeacherChatPage() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { data: rooms, isLoading: roomsLoading } = useChatRooms();
  
  // Set default active room
  useEffect(() => {
    if (rooms && rooms.length > 0 && !activeRoomId) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const { data: activeChatData, isLoading: messagesLoading } = useChatMessages(activeRoomId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  const activeRoom = activeChatData?.room;
  const messages = activeChatData?.messages || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !activeRoomId) return;
    
    sendMessage(
      { courseId: activeRoomId, content: message },
      {
        onSuccess: () => {
          setMessage("");
        },
        onError: (err) => {
          alert(`Failed to send message: ${err.message}`);
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-7rem)] w-full">
      <PageHeader 
        title="Classroom Chat" 
        description="Communicate with students and staff members in real-time." 
      />

      <Card className="flex flex-row flex-1 overflow-hidden border-indigo-100 shadow-sm mt-2 p-0">
        {/* Left Sidebar - Chat Rooms */}
        <div className="hidden md:flex md:w-1/3 lg:w-1/4 border-r border-indigo-50 bg-slate-50/50 flex-col">
          <div className="p-4 border-b border-indigo-50 bg-white">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Conversations
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {roomsLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : rooms && rooms.length > 0 ? (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                      activeRoomId === room.id
                        ? "bg-indigo-100/80 text-indigo-900"
                        : "hover:bg-indigo-50 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
                        activeRoomId === room.id ? "bg-indigo-200" : "bg-white border shadow-sm"
                      )}>
                        <Users className={cn(
                          "h-5 w-5",
                          activeRoomId === room.id ? "text-indigo-700" : "text-slate-500"
                        )} />
                      </div>
                      <div className="hidden lg:block overflow-hidden">
                        <p className="font-medium text-sm truncate">{room.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {room.memberCount} members
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center p-4 text-sm text-slate-500">
                  No courses found.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Area - Chat Messages */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-indigo-50 flex items-center justify-between bg-white shadow-sm z-10 h-[73px]">
            {activeRoomId ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-indigo-100">
                  <AvatarFallback className="bg-indigo-50 text-indigo-700">
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-slate-800">{activeRoom?.title || "Loading..."}</h2>
                  {activeRoom && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      {activeRoom.memberCount} Participants
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 bg-slate-50/50 p-4">
            <div className="space-y-6 max-w-3xl mx-auto py-4 flex flex-col">
              {!activeRoomId ? (
                <div className="text-center text-slate-500 text-sm py-10">
                  Select a classroom from the left sidebar to start chatting.
                </div>
              ) : messagesLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-10">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  const isTeacher = msg.sender.role === "teacher";
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      key={msg.id}
                      className={cn(
                        "flex w-full",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "flex gap-3 max-w-[80%]",
                        isMe ? "flex-row-reverse" : "flex-row"
                      )}>
                        <Avatar className="h-8 w-8 mt-1 border shadow-sm">
                          {msg.sender.profilePhotoUrl && <AvatarImage src={msg.sender.profilePhotoUrl} />}
                          <AvatarFallback className={cn(
                            "text-xs font-medium text-white",
                            isMe ? "bg-indigo-600" : isTeacher ? "bg-amber-600" : "bg-slate-400"
                          )}>
                            {msg.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={cn(
                          "flex flex-col",
                          isMe ? "items-end" : "items-start"
                        )}>
                          <span className="text-[11px] text-slate-500 mb-1 px-1">
                            {msg.sender.name} {isTeacher && !isMe ? "(Teacher)" : ""} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
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
                })
              )}
              {/* Invisible div to scroll to bottom */}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-indigo-50">
            <form 
              onSubmit={handleSendMessage}
              className="flex items-center gap-3 max-w-4xl mx-auto"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={!activeRoomId ? "Select a room first" : "Type your message..."}
                disabled={!activeRoomId || isSending}
                className="flex-1 rounded-full border-slate-200 bg-slate-50 hover:bg-slate-100 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all h-11 px-5"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!message.trim() || !activeRoomId || isSending}
                className="rounded-full h-11 w-11 bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all shrink-0"
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}

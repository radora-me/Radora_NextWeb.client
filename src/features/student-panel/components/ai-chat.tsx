"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { useAiTutorContext, useSendAiMessage } from "@/features/student-panel/services";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function StudentAIChat() {
  const { data: tutorContext, isLoading: isContextLoading } = useAiTutorContext();
  const sendMutation = useSendAiMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message when context loads
  useEffect(() => {
    if (tutorContext && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello ${tutorContext.student.name.split(" ")[0]}! I'm your AI Study Assistant. I see you're enrolled in ${tutorContext.student.courses.length} courses and currently have a ${tutorContext.attendance.overallAttendance}% attendance rate. How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [tutorContext, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await sendMutation.mutateAsync({
        message: messageText,
        history,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      alert("Failed to get response from AI Tutor.");
      setMessages((prev) => prev.slice(0, -1)); // Remove the user message on failure
      setInput(messageText); // restore input
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  if (isContextLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <motion.div
      className="h-[calc(100vh-100px)] flex flex-col space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="shrink-0">
        <PageHeader
          title="AI Study Assistant"
          description="Powered by Hugging Face DeepSeek R1. Get help with homework and generate quizzes."
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex-1 min-h-0 flex gap-4">
        <Card className="flex-1 flex flex-col border shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1.5 rounded-md dark:bg-indigo-900/40">
                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-sm font-medium">Radora AI Tutor</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white" 
                    : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMutation.isPending && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="p-3 rounded-2xl text-sm bg-muted text-foreground rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 border-t bg-muted/10 shrink-0">
            <form onSubmit={handleFormSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Ask your study assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-background"
                disabled={sendMutation.isPending}
              />
              <Button type="submit" disabled={!input.trim() || sendMutation.isPending}>
                <Send className="h-4 w-4 shrink-0" />
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Suggested Prompts Sidebar */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-sm font-medium">Suggested Topics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2">
              {tutorContext?.suggestedPrompts?.map((prompt, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="h-auto py-2 px-3 text-xs justify-start text-left whitespace-normal font-normal"
                  onClick={() => handleSend(prompt)}
                  disabled={sendMutation.isPending}
                >
                  "{prompt}"
                </Button>
              ))}
              {(!tutorContext?.suggestedPrompts || tutorContext.suggestedPrompts.length === 0) && (
                <p className="text-xs text-muted-foreground">No suggestions right now.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}

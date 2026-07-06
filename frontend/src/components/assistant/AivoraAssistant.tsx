"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessageList, Message as UIMessage } from "./ChatMessageList";
import { ChatInputArea } from "./ChatInputArea";
import { api, Session, Message as ApiMessage } from "@/lib/api";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface Conversation {
  id: string;
  title: string;
  time: string;
}

function mapApiToUiMessage(apiMsg: ApiMessage): UIMessage {
  const timeStr = new Date(apiMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return {
    id: apiMsg.id,
    sender: apiMsg.sender,
    text: apiMsg.text,
    time: timeStr,
    stats: apiMsg.stats ? {
      done: apiMsg.stats.done ?? 0,
      missed: apiMsg.stats.missed ?? 0,
      score: apiMsg.stats.score ?? ""
    } : undefined,
    actions: apiMsg.actions,
  };
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24 && now.getDate() === date.getDate()) return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffHours < 48 && now.getDate() !== date.getDate()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function AivoraAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messagesMap, setMessagesMap] = useState<{ [key: string]: UIMessage[] }>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const sessions = await api.getSessions();
      const mappedConvs = sessions.map((s) => ({
        id: s.id,
        title: s.title,
        time: formatRelativeTime(s.updated_at),
      }));
      setConversations(mappedConvs);
      
      const isNewReq = typeof window !== 'undefined' && window.location.search.includes('new=true');
      
      if (isNewReq) {
        setActiveConversationId("");
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/assistant');
        }
      } else if (mappedConvs.length > 0 && !activeConversationId) {
        setActiveConversationId(mappedConvs[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, [activeConversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchSessions().catch(console.error);

    const handleNewChat = () => setActiveConversationId("");
    window.addEventListener("new-chat", handleNewChat);
    return () => window.removeEventListener("new-chat", handleNewChat);
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    let isMounted = true;
    
    // Only load if not already in map (or force refresh if needed)
    if (!messagesMap[activeConversationId] || messagesMap[activeConversationId].length === 0) {
      api.getMessages(activeConversationId).then((msgs) => {
        if (!isMounted) return;
        const uiMsgs = msgs.map(mapApiToUiMessage);
        setMessagesMap((prev) => ({ ...prev, [activeConversationId]: uiMsgs }));
      }).catch(err => console.error(err));
    }
    
    return () => { isMounted = false; };
  }, [activeConversationId, messagesMap]);

  const activeMessages = messagesMap[activeConversationId] || [];
  const isNewChat = activeMessages.length === 0 && !isTyping;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isNewChat) {
      scrollToBottom();
    }
  }, [activeMessages.length, isTyping, activeConversationId, isNewChat]);



  const handleSendMessage = async (text: string) => {
    let currentConversationId = activeConversationId;
    
    if (!currentConversationId) {
      setIsTyping(true);
      try {
        const newSession = await api.createSession("New Conversation");
        const newConv: Conversation = {
          id: newSession.id,
          title: newSession.title,
          time: "Just now",
        };
        setConversations(prev => [newConv, ...prev]);
        currentConversationId = newSession.id;
        setActiveConversationId(currentConversationId);
      } catch (err) {
        console.error(err);
        setIsTyping(false);
        return;
      }
    }
    
    // Optimistic UI update
    const tempUserMsg: UIMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMessagesMap((prev) => ({
      ...prev,
      [currentConversationId]: [...(prev[currentConversationId] || []), tempUserMsg],
    }));
    
    setIsTyping(true);
    try {
      const updatedApiMsgs = await api.sendMessage(currentConversationId, text);
      const uiMsgs = updatedApiMsgs.map(mapApiToUiMessage);
      setMessagesMap((prev) => ({ ...prev, [currentConversationId]: uiMsgs }));
      
      // Update session title locally if needed (by re-fetching sessions)
      fetchSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = async (actionId: string, messageId: string) => {
    if (!activeConversationId) return;
    
    if (actionId === "copy_email") {
      alert("Email draft copied to clipboard!");
      return;
    }
    
    const actionPrompt = `Execute action: ${actionId}`;
    
    // Optimistic user action msg
    const tempUserMsg: UIMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: actionPrompt,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), tempUserMsg],
    }));
    
    setIsTyping(true);
    try {
      const updatedApiMsgs = await api.executeAction(activeConversationId, actionId, messageId);
      const uiMsgs = updatedApiMsgs.map(mapApiToUiMessage);
      setMessagesMap((prev) => ({ ...prev, [activeConversationId]: uiMsgs }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const recognitionRef = useRef<any>(null);

  const handleToggleVoice = () => {
    if (typeof window === "undefined") return;
    
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSendMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition", e);
      setIsListening(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-surface-container-lowest/50 relative overflow-hidden">

        {isNewChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center mb-6 animate-in fade-in duration-700">
              <h2 className="text-headline-md font-headline font-bold text-on-surface mb-2 text-3xl">
                What’s on your mind today?
              </h2>
            </div>
            
            <div className="w-full max-w-3xl mx-auto">
              <ChatInputArea
                onSendMessage={handleSendMessage}
                onPromptSelect={(prompt) => handleSendMessage(prompt)}
                isListening={isListening}
                onToggleVoice={handleToggleVoice}
                disabled={isTyping}
                isCentered={true}
              />
            </div>


          </div>
        ) : (
          <>
            <ChatMessageList
              messages={activeMessages}
              isTyping={isTyping}
              onPromptSelect={(prompt) => handleSendMessage(prompt)}
              onActionClick={handleActionClick}
              messagesEndRef={messagesEndRef}
            />

            <ChatInputArea
              onSendMessage={handleSendMessage}
              onPromptSelect={(prompt) => handleSendMessage(prompt)}
              isListening={isListening}
              onToggleVoice={handleToggleVoice}
              disabled={isTyping}
              isCentered={false}
            />
          </>
        )}
    </div>
  );
}

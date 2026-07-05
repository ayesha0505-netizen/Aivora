"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { SideNavBar, Conversation } from "./SideNavBar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList, Message as UIMessage } from "./ChatMessageList";
import { ChatInputArea } from "./ChatInputArea";
import { api, Session, Message as ApiMessage } from "@/lib/api";

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
  const [activeTab, setActiveTab] = useState("assistant");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
      if (mappedConvs.length > 0 && !activeConversationId) {
        setActiveConversationId(mappedConvs[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, [activeConversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchSessions().catch(console.error);
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
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const isNewChat = activeMessages.length === 0 && !isTyping;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isNewChat) {
      scrollToBottom();
    }
  }, [activeMessages.length, isTyping, activeConversationId, isNewChat]);

  const handleNewEntry = async () => {
    setIsTyping(true);
    try {
      const newSession = await api.createSession("New Conversation");
      const newConv: Conversation = {
        id: newSession.id,
        title: newSession.title,
        time: "Just now",
      };
      setConversations([newConv, ...conversations]);
      
      const initMsgs = await api.getMessages(newSession.id);
      setMessagesMap((prev) => ({ ...prev, [newSession.id]: initMsgs.map(mapApiToUiMessage) }));
      
      setActiveConversationId(newSession.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteSession(id);
      const updated = conversations.filter((c) => c.id !== id);
      setConversations(updated);
      const nextMap = { ...messagesMap };
      delete nextMap[id];
      setMessagesMap(nextMap);
      
      if (activeConversationId === id) {
        if (updated.length > 0) {
          setActiveConversationId(updated[0].id);
        } else {
          handleNewEntry();
        }
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return;
    
    // Optimistic UI update
    const tempUserMsg: UIMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), tempUserMsg],
    }));
    
    setIsTyping(true);
    try {
      const updatedApiMsgs = await api.sendMessage(activeConversationId, text);
      const uiMsgs = updatedApiMsgs.map(mapApiToUiMessage);
      setMessagesMap((prev) => ({ ...prev, [activeConversationId]: uiMsgs }));
      
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

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage("Can you review my appointments for tomorrow and highlight any conflicts?");
      }, 3500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden">
      <SideNavBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isOpenMobile={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNewEntry={handleNewEntry}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onDeleteConversation={handleDeleteChat}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`flex-1 flex flex-col relative h-screen bg-surface-container-lowest/50 transition-all duration-300 overflow-hidden ${
        isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
      }`}>
        <ChatHeader
          title={activeConversation?.title || "AI Assistant"}
          status="Optimized"
          onOpenMobileNav={() => setMobileNavOpen(true)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

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
      </main>
    </div>
  );
}

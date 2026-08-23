import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Phone, MessageSquare, ShieldCheck, MapPin, Clock, ArrowLeft, CheckCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MessagesView() {
  const {
    conversations,
    activeChatStylistId,
    setActiveChatStylistId,
    staffList,
    sendMessage,
    setSelectedStylist,
    setShowSafetyModal,
    addToast
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find((c) => c.stylistId === activeChatStylistId) || conversations[0];
  const stylistObj = staffList.find((s) => s.id === activeConversation?.stylistId) || staffList[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(activeConversation.stylistId, inputMessage);
    setInputMessage('');
  };

  const handleQuickReply = (text) => {
    sendMessage(activeConversation.stylistId, text);
  };

  const quickReplies = [
    "I'm outside your dorm room!",
    "Running 5 mins late, be right there.",
    "What length hair should I purchase?",
    "Can I pay with Airtel / MTN mobile money?"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Top Title */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0">Stylist Messages</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Direct coordination for in-dorm & studio appointments</p>
        </div>

        <button
          onClick={() => setShowSafetyModal(true)}
          className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer"
        >
          <ShieldCheck size={15} />
          <span>Safety Code</span>
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="card flex-1 flex flex-col md:flex-row overflow-hidden border border-black/10 dark:border-white/10">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 p-3 bg-black/[0.02] dark:bg-white/[0.02] flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          {conversations.map((conv) => {
            const isSelected = conv.stylistId === activeChatStylistId;
            return (
              <div
                key={conv.stylistId}
                onClick={() => setActiveChatStylistId(conv.stylistId)}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 shrink-0 md:shrink w-64 md:w-full border ${
                  isSelected
                    ? 'bg-[#007AFF]/15 border-[#007AFF]/40 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/15'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={conv.avatar} alt={conv.stylistName} className="w-11 h-11 rounded-2xl object-cover" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#007AFF] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate m-0">{conv.stylistName}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{conv.lastTimestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate m-0">{conv.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Area: Active Chat Window */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#121217]">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setSelectedStylist(stylistObj)}
              title="View Stylist Profile"
            >
              <img src={activeConversation.avatar} alt={activeConversation.stylistName} className="w-10 h-10 rounded-2xl object-cover shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">{activeConversation.stylistName}</h3>
                  <span className="badge badge-verified text-[9px] py-0.2 px-1">Verified</span>
                </div>
                <span className="text-[10px] text-slate-400">{activeConversation.stylistRole} • {stylistObj.dormLocation}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/260772822579?text=Hi%20${encodeURIComponent(activeConversation.stylistName)},%20I'm%20chatting%20with%20you%20from%20the%20UniHairShop%20App.`}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
              title="Switch to WhatsApp"
            >
              <MessageSquare size={13} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeConversation.messages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#007AFF] text-white rounded-br-none shadow-apple-blue'
                        : 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-none border border-black/5 dark:border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                    {msg.time}
                    {isMe && <CheckCheck size={11} className="text-blue-400" />}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Student Quick Replies */}
          <div className="px-3 pt-2 pb-1 border-t border-black/5 dark:border-white/5 flex gap-1.5 overflow-x-auto bg-black/[0.01] dark:bg-white/[0.01]">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(reply)}
                className="text-[11px] bg-black/5 dark:bg-white/5 hover:bg-amber-400/20 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full whitespace-nowrap border border-black/5 dark:border-white/10 cursor-pointer transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-black/10 dark:border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Type your message to stylist..."
              className="form-input py-2 text-xs flex-1"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="apple-btn-primary text-xs px-4 py-2"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

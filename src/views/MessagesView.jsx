import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Search,
  Check,
  Copy,
  Scissors,
  User,
  X,
  ExternalLink,
  ShieldAlert,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MessagesView() {
  const {
    conversations,
    activeChatStylistId,
    setActiveChatStylistId,
    staffList,
    sendMessage,
    setSelectedStylist,
    userMode,
    user,
    currentCampus,
    addToast
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatSafetyModal, setShowChatSafetyModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const messagesEndRef = useRef(null);

  // Active Conversation
  const activeConversation = conversations.find((c) => c.stylistId === activeChatStylistId) || conversations[0] || {
    id: 'conv-default',
    stylistId: 'stf-1',
    stylistName: 'Junior "The Fade King"',
    stylistRole: 'Master Barber & Stylist',
    avatar: '/images/barber_service.jpg',
    lastMessage: 'Ready for your appointment!',
    lastTimestamp: 'Active',
    unreadCount: 0,
    messages: []
  };

  const stylistObj = staffList.find((s) => s.id === activeConversation?.stylistId) || {
    id: activeConversation?.stylistId || 'stf-1',
    name: activeConversation?.stylistName || 'Campus Stylist',
    role: activeConversation?.stylistRole || 'Hair Specialist',
    phone: '0971234567',
    dormLocation: 'Hostel Studio',
    campus: currentCampus,
    avatar: activeConversation?.avatar || '/images/barber_service.jpg'
  };

  // Generate deterministic Chat-Specific Safety Verification Code
  const chatSafetyCode = `SEC-${(activeConversation.stylistId || 'STF').replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase()}-${Math.abs(
    (activeConversation.stylistName || 'UNI').split('').reduce((acc, char) => acc + char.charCodeAt(0), 100) % 9000 + 1000
  )}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(activeConversation.stylistId, inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickReply = (text) => {
    sendMessage(activeConversation.stylistId, text);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(chatSafetyCode);
      setCopiedCode(true);
      addToast(`Safety Code ${chatSafetyCode} copied!`, 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Filter conversations list
  const filteredConversations = conversations.filter((c) =>
    c.stylistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickReplies = userMode === 'vendor' ? [
    "I'm on my way to your hostel room now!",
    "Please share your exact room number & floor.",
    "Ready for you at my hostel studio!",
    "Appointment confirmed, see you shortly."
  ] : [
    "Are you available for a dorm visit today at 2 PM?",
    "I'm in my hostel room and ready!",
    "What length hair/braids should I buy?",
    "Can I pay with Airtel Money / MTN MoMo on arrival?"
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[550px]">
      {/* Top Header & Safety Pill */}
      <div className="flex flex-wrap justify-between items-center px-1 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0">
              {userMode === 'vendor' ? 'Client Appointments & Inquiries' : 'Campus Stylist Direct Chat'}
            </h1>
            <span className="badge badge-in-stock text-[9px] py-0.2 px-1.5">Realtime</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
            {userMode === 'vendor'
              ? 'Coordinate dorm appointments, arrival times, and hairstyle consultations with campus clients'
              : 'Direct communication with your verified campus stylist for room visits and studio sessions'}
          </p>
        </div>

        {/* Chat-Specific Safety Verification Trigger */}
        <button
          onClick={() => setShowChatSafetyModal(true)}
          className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold"
          title="View Chat Safety Verification Code"
        >
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Safety Code: <strong className="font-mono text-amber-500">{chatSafetyCode}</strong></span>
        </button>
      </div>

      {/* Main Apple-Grade Chat Container */}
      <div className="card flex-1 flex flex-col md:flex-row overflow-hidden border border-black/10 dark:border-white/10 shadow-lg">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 p-3 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col gap-2">
          {/* Search Field */}
          <div className="relative mb-1">
            <input
              type="text"
              placeholder={userMode === 'vendor' ? 'Search clients...' : 'Search campus stylists...'}
              className="form-input pl-8 text-xs py-1.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto flex-1 pr-0.5">
            {filteredConversations.map((conv) => {
              const isSelected = conv.stylistId === activeChatStylistId;
              return (
                <div
                  key={conv.stylistId}
                  onClick={() => setActiveChatStylistId(conv.stylistId)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 shrink-0 md:shrink w-64 md:w-full border ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400/50 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-white/60 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-amber-400/30'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={conv.avatar} alt={conv.stylistName} className="w-11 h-11 rounded-2xl object-cover" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold">
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
        </div>

        {/* Right Area: Active Chat Window */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#121217]">
          {/* Active Chat Header */}
          <div className="p-3 sm:p-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 bg-black/[0.01] dark:bg-white/[0.01]">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setSelectedStylist(stylistObj)}
              title="View Profile Details"
            >
              <img
                src={activeConversation.avatar}
                alt={activeConversation.stylistName}
                className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-black/10 dark:border-white/10"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0 truncate">
                    {activeConversation.stylistName}
                  </h3>
                  <span className="badge badge-verified text-[9px] py-0.2 px-1">Verified</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {activeConversation.stylistRole} • {stylistObj.dormLocation || 'Hostel Studio'}
                </span>
              </div>
            </div>

            {/* Header Direct Actions */}
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/260${(stylistObj.phone || '0971234567').replace(/^0/, '')}?text=Hi%20${encodeURIComponent(activeConversation.stylistName)},%20I'm%20chatting%20with%20you%20from%20the%20UniHairShop%20App%20(Safety%20Code:%20${chatSafetyCode}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"
                title="Open WhatsApp Chat"
              >
                <MessageSquare size={13} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <button
                onClick={() => setShowChatSafetyModal(true)}
                className="icon-btn text-emerald-500 hover:bg-emerald-500/10"
                title="Verify Safety Code"
              >
                <ShieldCheck size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* Safety Notice Banner */}
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                <span>Verify Chat Safety Code: <strong className="font-mono text-amber-500 font-bold">{chatSafetyCode}</strong></span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-300 hover:underline bg-transparent border-0 cursor-pointer"
              >
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Message Bubbles */}
            {activeConversation.messages && activeConversation.messages.map((msg, i) => {
              const isMyMessage = userMode === 'vendor' ? msg.sender === 'stylist' : msg.sender === 'user';

              return (
                <div
                  key={msg.id || i}
                  className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMyMessage
                        ? 'bg-amber-400 text-slate-950 font-medium rounded-br-xs'
                        : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-900 dark:text-white rounded-bl-xs border border-black/5 dark:border-white/5'
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">{msg.time || 'Just now'}</span>
                    {isMyMessage && (
                      <CheckCheck size={12} className="text-amber-500" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestion Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-black/5 dark:border-white/5 flex gap-1.5 overflow-x-auto bg-black/[0.01] dark:bg-white/[0.01]">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(reply)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-amber-400/20 hover:text-amber-500 border border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder={userMode === 'vendor' ? 'Reply to student client...' : 'Type message to stylist...'}
              className="form-input flex-1 text-xs py-2.5 rounded-2xl"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="apple-btn-primary p-2.5 rounded-2xl shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {/* CHAT-SPECIFIC CAMPUS SAFETY & IDENTITY VERIFICATION MODAL */}
      {showChatSafetyModal && (
        <div className="modal-overlay" onClick={() => setShowChatSafetyModal(false)}>
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowChatSafetyModal(false)}>
              <X size={18} />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-2.5">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">Chat Safety Verification</h3>
              <p className="text-xs text-slate-400 mt-0.5">Campus Hostel Identity & Anti-Impersonation Protocol</p>
            </div>

            {/* Prominent Code Display */}
            <div className="card p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white text-center border-amber-400/30 mb-4">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Official Verification Code
              </span>
              <span className="text-2xl font-mono font-extrabold text-amber-400 tracking-wider my-1 block">
                {chatSafetyCode}
              </span>
              <p className="text-[11px] text-slate-300 m-0">
                Conversation: <strong>{user.name}</strong> ↔ <strong>{activeConversation.stylistName}</strong>
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="apple-btn-primary w-full text-xs py-2.5 mb-4 flex items-center justify-center gap-1.5"
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedCode ? 'Code Copied to Clipboard!' : 'Copy Safety Code'}</span>
            </button>

            {/* Instructions */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
              <div className="flex items-start gap-2">
                <CheckCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>When the stylist arrives at your hostel room, match this exact code on their device.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>All campus stylists are verified students with registered university IDs.</span>
              </div>
            </div>

            {/* Emergency Hotline */}
            <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-center text-[11px] text-slate-400">
              <span>Campus Security Helpline: <strong className="text-slate-900 dark:text-white">0971-000-111</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

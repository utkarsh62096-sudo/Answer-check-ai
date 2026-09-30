import React, { useState, useRef, useEffect } from 'react';
import { EvaluationResult, ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  Lightbulb,
  FileEdit,
  AlertCircle,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface DiscussModeProps {
  subject: string;
  question: string;
  studentAnswer: string;
  maxMarks: number;
  evaluation: EvaluationResult;
  initialQuestion?: string;
  isModal?: boolean;
  onClose?: () => void;
}

const INITIAL_MENTOR_MESSAGE = `Evaluation ho gaya! Ab Discuss Mode on hai.  
Batao kya discuss karna hai?  

• Concept clear nahi hua?  
• Answer better kaise likhein?  
• Important points miss ho gaye?  
• Kuch aur doubt?`;

const QUICK_QUESTIONS = [
  { label: '💡 Concept clear nahi hua?', prompt: 'Concept samajh nahi aaya theek se. Basic se simple Hinglish mein explain karo with real-life example.' },
  { label: '📝 Answer better kaise likhein?', prompt: 'Mera answer better kaise ban sakta hai? Mere hi answer ko improve karke dikhao with proper CBSE keywords & value points.' },
  { label: '🎯 Important points miss ho gaye?', prompt: 'Mere answer mein kaunse important CBSE NCERT points miss ho gaye jo examiner dhundh raha tha?' },
  { label: '❌ Why marks were lost?', prompt: 'Marks kahan aur kyun kate? Examiner ke point of view se honestly samjhao.' },
  { label: '✍️ Keywords & Diagrams', prompt: 'Is answer mein kaunse technical CBSE keywords aur diagram hone chahiye the full marks ke liye?' },
  { label: '🇬🇧 Explain in English', prompt: 'Can you please explain the key weaknesses and how to write a 100% full-mark answer in English?' },
];

export function DiscussMode({
  subject,
  question,
  studentAnswer,
  maxMarks,
  evaluation,
  initialQuestion,
  isModal = false,
  onClose,
}: DiscussModeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: INITIAL_MENTOR_MESSAGE,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContextPreview, setShowContextPreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle optional initial prompt passed in
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: INITIAL_MENTOR_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discuss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          question,
          studentAnswer,
          maxMarks,
          evaluation,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from mentor');
      }

      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err: any) {
      console.error('Error communicating with Discuss Mode:', err);
      setError(err?.message || 'Connection to mentor failed. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div
      className={`bg-white flex flex-col transition-all duration-200 ${
        isModal
          ? 'h-full max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden'
          : `rounded-2xl border border-indigo-200 shadow-sm overflow-hidden ${
              isExpanded ? 'h-[750px]' : 'h-[580px]'
            }`
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <span className="text-xl" role="img" aria-label="Mentor">👨‍🏫</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-indigo-800 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Discuss Mode
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                CBSE Study Mentor
              </span>
            </div>
            <p className="text-xs text-indigo-100 flex items-center gap-1.5 mt-0.5">
              <span>Friendly senior + strict teacher • Hinglish</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-300" />
              <span>Score: {evaluation.estimatedScore}/{maxMarks}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowContextPreview(!showContextPreview)}
            className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="View current question & answer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Context</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1"
            title="Restart Discussion"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {!isModal && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isExpanded ? 'Collapse height' : 'Expand height'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
              title="Close Discuss Mode"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Context Accordion preview if toggled */}
      {showContextPreview && (
        <div className="bg-indigo-50/70 border-b border-indigo-100 p-3 text-xs text-slate-700 animate-fadeIn space-y-1.5 max-h-40 overflow-y-auto">
          <div>
            <span className="font-bold text-indigo-900">Q: </span>
            <span className="text-slate-800">{question}</span>
          </div>
          <div className="bg-white p-2 rounded border border-indigo-100 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Your Answer: </span>
            <span>{studentAnswer}</span>
          </div>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shrink-0 text-xs shadow-2xs mt-0.5">
                  👨‍🏫
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs relative group ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-100 text-[11px] font-semibold text-indigo-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>CBSE Study Mentor</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors opacity-80 group-hover:opacity-100"
                      title="Copy advice"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Message Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {isUser && (
                  <div className="mt-1 text-[10px] text-indigo-200 text-right">
                    You
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 text-xs shadow-2xs mt-0.5">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 sm:gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs shadow-2xs animate-pulse">
              👨‍🏫
            </div>
            <div className="bg-white border border-indigo-100 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-600 rounded-tl-xs flex items-center gap-2 shadow-2xs">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-xs text-indigo-700 font-medium">Mentor is analyzing your answer...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => sendMessage(messages[messages.length - 1]?.content || 'Explain again')}
              className="text-xs font-bold text-rose-700 hover:underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200">
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
          <HelpCircle className="w-3 h-3 text-indigo-600" />
          <span>Quick Discussion Topics:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage(q.prompt)}
              className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 transition-colors shadow-2xs whitespace-nowrap disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={handleFormSubmit}
        className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask mentor in Hinglish or English... (e.g. Is point mein kya likhna tha?)"
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { aiChat } from '@/src/lib/api/ai';

interface Message {
  role: 'user' | 'ai.ts';
  content: string;
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    // 실제 AI API 호출
    const { data, error } = await aiChat(input);

    setMessages((prev) => [
      ...prev,
      { role: 'ai.ts', content: data || '답변을 받아오지 못했습니다.' },
    ]);
    setLoading(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
      <>
        {/* 플로팅 버튼 */}
        <button
            className={clsx(
                'fixed z-50 bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center bg-slate-900 text-white transition-all',
                open && 'scale-0 pointer-events-none'
            )}
            aria-label="챗봇 열기"
            onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-8 h-8" />
        </button>

        {/* 챗봇 채팅창 */}
        <div
            className={clsx(
                'fixed z-50 bottom-6 right-6 w-80 max-w-[90vw] h-[500px] rounded-xl shadow-2xl border flex flex-col transition-all',
                open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
                'bg-white text-gray-900 border-gray-300',
                'dark:bg-slate-900 dark:text-white dark:border-gray-700'
            )}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100 border-gray-300 dark:bg-slate-800 dark:border-gray-700">
            <span className="font-bold">ETF 도우미</span>
            <button
                className="hover:text-gray-600 dark:hover:text-gray-400"
                onClick={() => setOpen(false)}
                aria-label="챗봇 닫기"
            >
              ×
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                      className={clsx(
                          'px-3 py-2 rounded-lg text-sm max-w-[75%]',
                          msg.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-900 dark:bg-slate-700 dark:text-gray-100'
                      )}
                  >
                    {msg.content}
                  </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <form
              onSubmit={sendMessage}
              className="flex p-3 border-t gap-2 bg-gray-100 border-gray-300 dark:bg-slate-800 dark:border-gray-700"
          >
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="메시지를 입력하세요..."
                className="flex-1 border border-gray-400 rounded px-2 py-1 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-900 dark:text-white dark:placeholder-gray-400"
            />
            <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded disabled:opacity-50"
            >
              전송
            </button>
          </form>
        </div>
      </>
  );
}

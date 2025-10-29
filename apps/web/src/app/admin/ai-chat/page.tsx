'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hej! Jag är din AI-assistent för AIFM Portal. Jag har full insyn i systemet och kan hjälpa dig med:\n\n• Förklara vad som händer i systemet\n• Ge insikter om tasks och reports\n• Hjälpa med beslut och rekommendationer\n• Förklara workflows och processer\n\nVad kan jag hjälpa dig med idag?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.response };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Tyvärr kunde jag inte behandla din fråga just nu. Försök igen senare.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">AI ASSISTANT</h1>
          <p className="text-gray-600 text-sm uppercase tracking-wide">Chat with AI that understands your system</p>
        </div>

        {/* Chat Container */}
        <Card className="border-2 border-gray-200 bg-white rounded-3xl flex flex-col h-[calc(100vh-300px)]">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl uppercase tracking-wide flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-600" />
              AI Assistant
            </CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`
                    max-w-[80%] rounded-3xl p-4
                    ${message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black border-2 border-gray-200'
                    }
                  `}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 border-2 border-gray-200 rounded-3xl p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Fråga mig något om systemet..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black transition-all uppercase tracking-wide text-sm"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="rounded-2xl uppercase tracking-wide font-semibold px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


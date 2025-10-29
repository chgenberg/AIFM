'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Send, Bot, User, Loader2, XCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for AIFM Portal. I have full insight into the system and can help you with:\n\n• Explaining what\'s happening in the system\n• Providing insights about tasks and reports\n• Helping with decisions and recommendations\n• Explaining workflows and processes\n\nWhat can I help you with today?',
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
    const userInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (!data.response) {
        throw new Error('No response received from AI');
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage = error?.message || 'Sorry, I couldn\'t process your question right now. Please try again later.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${errorMessage}\n\nIf this problem persists, please check:\n• OpenAI API key is configured\n• You have internet connectivity\n• The AI service is available`,
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
                placeholder="Ask me anything about the system..."
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


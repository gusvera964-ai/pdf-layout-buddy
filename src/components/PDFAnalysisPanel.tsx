import { useState, useRef, useEffect } from 'react';
import { MessageCircle, FileText, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface PDFAnalysisPanelProps {
  fileName: string;
  isAnalyzing: boolean;
}

export const PDFAnalysisPanel = ({ fileName, isAnalyzing }: PDFAnalysisPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock summary data
  const summary = {
    title: "Анализ документа",
    content: `Подробное резюме статьи "${fileName}". Документ содержит важную информацию о методах анализа данных и современных подходах к обработке информации. Ключевые темы включают машинное обучение, статистический анализ и практические применения.`,
    keyPoints: [
      "Введение в методы анализа данных",
      "Статистические подходы и их применение", 
      "Машинное обучение в современных исследованиях",
      "Практические рекомендации и выводы"
    ],
    wordCount: 2847,
    pages: 12,
    readingTime: "11 минут"
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const question = inputMessage;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Simulate AI response
    timerRef.current = setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Я проанализировал ваш вопрос "${question}" в контексте документа "${fileName}". Согласно содержанию PDF, могу предоставить следующую информацию...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-pdf-primary" />
          Чат с PDF
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {fileName}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && !isAnalyzing && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Начните диалог с вашим PDF документом</p>
                <p className="text-sm mt-2">Задайте любой вопрос о содержании документа</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.type === 'user' 
                      ? 'bg-pdf-primary text-white' 
                      : 'bg-pdf-accent text-white'
                    }
                  `}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`
                    p-3 rounded-lg
                    ${message.type === 'user'
                      ? 'bg-pdf-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                    }
                  `}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-pdf-accent text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Задайте вопрос о документе..."
              className="flex-1"
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isAnalyzing}
              className="bg-pdf-primary hover:bg-pdf-primary-hover text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
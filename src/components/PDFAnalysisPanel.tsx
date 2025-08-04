import { useState } from 'react';
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

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Я проанализировал ваш вопрос "${inputMessage}" в контексте документа "${fileName}". Согласно содержанию PDF, могу предоставить следующую информацию...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

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
          <FileText className="w-5 h-5 mr-2 text-pdf-primary" />
          Анализ PDF
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {fileName}
        </p>
      </div>

      <Tabs defaultValue="summary" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
          <TabsTrigger value="summary">Резюме</TabsTrigger>
          <TabsTrigger value="chat">Чат с PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="flex-1 p-4 overflow-auto">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-pdf-primary mx-auto mb-4" />
                <p className="text-gray-600">Анализирую документ...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-pdf-surface to-pdf-surface-alt border-pdf-primary/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {summary.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {summary.content}
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-semibold text-pdf-primary">{summary.pages}</div>
                    <div className="text-gray-600">страниц</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-semibold text-pdf-primary">{summary.wordCount}</div>
                    <div className="text-gray-600">слов</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-semibold text-pdf-primary">{summary.readingTime}</div>
                    <div className="text-gray-600">чтения</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Ключевые моменты:</h4>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-pdf-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="flex-1 flex flex-col">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
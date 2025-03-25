
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, UploadCloud, Image, Clock, Sparkles, Languages } from 'lucide-react';
import MainNavigation from "@/components/MainNavigation";
import { toast } from "@/hooks/use-toast";
import { getTranslation } from "@/utils/translations";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Сайн байна уу! Би таны хичээлийн туслах AI. Би танд хэрхэн туслах вэ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const language = localStorage.getItem('language') || 'mn';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response with Mongolian responses
    setTimeout(() => {
      const responses = [
        "Би таны асуултыг ойлгож байна. Энэ нь математикийн бодлого уу?",
        "Энэ сонирхолтой асуулт байна. Би танд туслахдаа баяртай байна.",
        "Би энэ талаар дэлгэрэнгүй мэдээлэл өгье.",
        "Таны асуултад хариулахын тулд надад илүү мэдээлэл хэрэгтэй.",
        "Энэ нь маш сайн асуулт байна. Энэ талаар бид нарийвчлан ярилцаж болно."
      ];
      
      const responseIndex = Math.floor(Math.random() * responses.length);
      
      const aiMessage: Message = {
        role: 'assistant',
        content: responses[responseIndex],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    toast({
      title: getTranslation(language, "comingSoon"),
      description: getTranslation(language, "featureComingSoon"),
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavigation />
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="container h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4 flex flex-col">
          <Card className="flex-1 flex flex-col shadow-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Sparkles size={20} />
                <h3 className="font-medium">{getTranslation(language, "aiAssistant")}</h3>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  setMessages([{
                    role: 'assistant',
                    content: 'Сайн байна уу! Би таны хичээлийн туслах AI. Би танд хэрхэн туслах вэ?',
                    timestamp: new Date()
                  }]);
                }}
              >
                {getTranslation(language, "newChat")}
              </Button>
            </div>
            
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start ${message.role === 'user' ? 'flex-row-reverse' : ''} max-w-[80%] ${message.role === 'user' ? 'ml-auto' : ''}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'ml-2 bg-primary/20' : 'mr-2 bg-primary/20'} flex-shrink-0`}
                    >
                      {message.role === 'user' ? (
                        <span className="text-primary text-sm font-medium">U</span>
                      ) : (
                        <Sparkles size={16} className="text-primary" />
                      )}
                    </div>
                    <div 
                      className={`rounded-xl p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <div className="bg-secondary rounded-xl p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-border bg-card">
                <div className="flex space-x-2 mb-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={handleFileUpload}>
                    <UploadCloud size={16} className="mr-1" /> {getTranslation(language, "upload")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={handleFileUpload}>
                    <Image size={16} className="mr-1" /> {getTranslation(language, "image")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full ml-auto" onClick={() => toast({ title: getTranslation(language, "comingSoon") })}>
                    <Clock size={16} className="mr-1" /> {getTranslation(language, "history")}
                  </Button>
                </div>
                <div className="flex items-center">
                  <Textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'mn' ? "Хичээлийнхээ талаар асуух..." : "Ask anything about your studies..."}
                    className="min-h-[40px] resize-none"
                    rows={1}
                  />
                  <Button 
                    className="ml-2" 
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

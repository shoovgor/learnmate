
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  UploadCloud, 
  Image as ImageIcon, 
  Clock, 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  Flame,
  Zap,
  Book
} from 'lucide-react';
import { getTranslation } from "@/utils/translations";

interface AIAssistantProps {
  fullPage?: boolean;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Suggestion = {
  text: string;
  icon: React.ReactNode;
};

const AIAssistant: React.FC<AIAssistantProps> = ({ fullPage = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Сайн байна уу! Би таны хичээлийн туслах AI. Би танд хэрхэн туслах вэ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const language = localStorage.getItem('language') || 'mn';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

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
    
    // Hide suggestions after first message
    setShowSuggestions(false);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const suggestions: Suggestion[] = [
    { 
      text: language === 'mn' 
        ? 'Энэ квадрат тэгшитгэлийг хэрхэн бодох вэ: x² - 5x + 6 = 0' 
        : 'How do I solve this quadratic equation: x² - 5x + 6 = 0',
      icon: <Flame className="h-4 w-4 text-orange-500" />
    },
    { 
      text: language === 'mn' 
        ? 'Фотосинтезийн процессийг тайлбарлаж өгнө үү?' 
        : 'Can you explain the process of photosynthesis?',
      icon: <Lightbulb className="h-4 w-4 text-yellow-500" />
    },
    { 
      text: language === 'mn' 
        ? '2-р дэлхийн дайны талаар товч мэдээлэл өгнө үү' 
        : 'Give me a brief overview of World War II',
      icon: <Book className="h-4 w-4 text-blue-500" />
    },
    { 
      text: language === 'mn' 
        ? 'Эсийн бүтцийн талаар зурган тайлбар хийнэ үү' 
        : 'Can you describe the structure of a cell with a diagram?',
      icon: <Zap className="h-4 w-4 text-purple-500" />
    }
  ];

  const renderContent = () => (
    <Card className={`flex-1 flex flex-col shadow-lg overflow-hidden ${fullPage ? 'max-w-4xl w-full mx-auto h-[calc(100vh-8rem)]' : 'w-full'}`}>
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
            setShowSuggestions(true);
          }}
        >
          {getTranslation(language, "newChat")}
        </Button>
      </div>
      
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex items-start ${message.role === 'user' ? 'flex-row-reverse' : ''} max-w-[90%] ${message.role === 'user' ? 'ml-auto' : ''} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'ml-2 bg-primary' : 'mr-2 bg-primary/20'
                } flex-shrink-0`}
              >
                {message.role === 'user' ? (
                  <span className="text-primary-foreground text-sm font-medium">U</span>
                ) : (
                  <Sparkles size={16} className="text-primary" />
                )}
              </div>
              <div 
                className={`rounded-xl p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
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
            <div className="flex items-start max-w-[90%] animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div className="bg-muted rounded-xl p-4">
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
        
        {showSuggestions && (
          <div className="px-4 py-3 border-t animate-fade-in">
            <p className="text-sm font-medium mb-2">{getTranslation(language, "suggestedPrompts")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-2 text-left"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{suggestion.icon}</span>
                    <span className="line-clamp-1 text-sm">{suggestion.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-border bg-card">
          <div className="flex space-x-2 mb-2">
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              <UploadCloud size={14} className="mr-1" /> {getTranslation(language, "upload")}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full text-xs">
              <ImageIcon size={14} className="mr-1" /> {getTranslation(language, "image")}
            </Button>
            {showSuggestions ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full ml-auto text-xs"
                onClick={() => setShowSuggestions(false)}
              >
                <ChevronUp size={14} className="mr-1" /> {getTranslation(language, "hideSuggestions")}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full ml-auto text-xs"
                onClick={() => setShowSuggestions(true)}
              >
                <ChevronDown size={14} className="mr-1" /> {getTranslation(language, "showSuggestions")}
              </Button>
            )}
          </div>
          <div className="flex items-center">
            <Textarea 
              ref={textareaRef}
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
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (fullPage) {
    return renderContent();
  }

  return (
    <section id="how-it-works" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <span className="text-sm font-medium text-primary">AI Assistant</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            {getTranslation(language, 'yourStudyCompanion')}
          </h2>
          <p className="text-muted-foreground">
            {getTranslation(language, 'aiAssistantDescription')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center max-w-6xl mx-auto">
          <div className="lg:w-1/2 animate-fade-in">
            {renderContent()}
          </div>
          
          <div className="lg:w-1/2 space-y-6 animate-fade-up">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold">{getTranslation(language, 'askAnyQuestion')}</h3>
              </div>
              <p className="text-muted-foreground pl-11">
                {getTranslation(language, 'askAnyQuestionDescription')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold">{getTranslation(language, 'uploadAssignments')}</h3>
              </div>
              <p className="text-muted-foreground pl-11">
                {getTranslation(language, 'uploadAssignmentsDescription')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold">{getTranslation(language, 'getPersonalizedHelp')}</h3>
              </div>
              <p className="text-muted-foreground pl-11">
                {getTranslation(language, 'getPersonalizedHelpDescription')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold">{getTranslation(language, 'practiceWithGeneratedQuizzes')}</h3>
              </div>
              <p className="text-muted-foreground pl-11">
                {getTranslation(language, 'practiceWithGeneratedQuizzesDescription')}
              </p>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button size="lg" asChild className="animate-pulse">
                <Link to="/ai-assistant">
                  {getTranslation(language, 'tryAiAssistant')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MessageCircle, ThumbsUp, CheckCircle } from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';
import { getTranslation } from "@/utils/translations";

type QuestionType = {
  id: number;
  title: string;
  content: string;
  author: { 
    name: string; 
    avatar: string; 
  };
  solved: boolean;
  classLevel: string;
  subject: string;
  createdAt: string;
  upvotes: number;
  answers: number;
  views: number;
};

const CommunityClassLevel = () => {
  const { classLevel } = useParams<{ classLevel: string }>();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const language = localStorage.getItem('language') || 'mn';
  
  useEffect(() => {
    // Simulate API call to fetch questions for the selected class level
    setTimeout(() => {
      const mockQuestions: QuestionType[] = [
        {
          id: 1,
          title: "Логарифмын функцийн график зурахад тусламж хэрэгтэй байна",
          content: "Би энэ логарифмын функцийн графикийг хэрхэн зурахаа мэдэхгүй байна: f(x) = log₃(x-2)",
          author: { name: "Батболд", avatar: "" },
          solved: false,
          classLevel: "11",
          subject: "Математик",
          createdAt: "2023-12-01",
          upvotes: 5,
          answers: 2,
          views: 42
        },
        {
          id: 2,
          title: "Ньютоны хөдөлгөөний хоёр дахь хуулийг тайлбарлана уу",
          content: "Би Ньютоны хөдөлгөөний хоёр дахь хуулийг ойлгохгүй байна. Энэ нь хүчтэй хамааралтай гэдгийг би мэднэ, гэхдээ үүнийг ойлгоход надад туслаач.",
          author: { name: "Сувдаа", avatar: "" },
          solved: true,
          classLevel: "10",
          subject: "Физик",
          createdAt: "2023-11-28",
          upvotes: 12,
          answers: 4,
          views: 87
        },
        {
          id: 3,
          title: "Давсны дүүргэлтийн тэгшитгэл бичихэд тусламж хэрэгтэй",
          content: "Манай багш өнөөдөр даалгавар өгсөн: натрийн гидроксид, давсны хүчил хоёрын хооронд явагдах урвалын тэнцэтгэл бичих. Хэн нэг надад туслаж чадах уу?",
          author: { name: "Төгөлдөр", avatar: "" },
          solved: false,
          classLevel: "11",
          subject: "Хими",
          createdAt: "2023-11-25",
          upvotes: 3,
          answers: 1,
          views: 29
        },
        {
          id: 4,
          title: "Эсийн бүтцийн диаграм зурах",
          content: "Би ургамлын эсийн бүтцийн диаграмыг зурах хэрэгтэй, гэхдээ аль хэсгүүдийг багтаах ёстойгоо мэдэхгүй байна.",
          author: { name: "Мөнхзул", avatar: "" },
          solved: false,
          classLevel: "9",
          subject: "Биологи",
          createdAt: "2023-12-02",
          upvotes: 7,
          answers: 3,
          views: 56
        },
      ];
      
      // Filter questions by class level if provided
      const filteredQuestions = classLevel 
        ? mockQuestions.filter(q => q.classLevel === classLevel)
        : mockQuestions;
      
      setQuestions(filteredQuestions);
      setLoading(false);
    }, 1000);
  }, [classLevel]);
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/community">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {getTranslation(language, "backToCommunity")}
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getTranslation(language, "grade")} {classLevel} {getTranslation(language, "questions")}
              </h1>
              <p className="text-muted-foreground">
                {getTranslation(language, "browsingQuestionsForGrade")} {classLevel}
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              {questions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <Link to={`/community/question/${question.id}`} className="hover:underline">
                          <CardTitle className="text-xl">{question.title}</CardTitle>
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{question.subject}</Badge>
                          <Badge variant="outline">{getTranslation(language, "grade")} {question.classLevel}</Badge>
                          {question.solved && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {getTranslation(language, "solved")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{question.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={question.author.avatar} />
                          <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {question.author.name} • {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{question.upvotes}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{question.answers}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{getTranslation(language, "noQuestionsFound")}</h3>
              <p className="text-muted-foreground mt-2 mb-6">{getTranslation(language, "beFirstToAsk")}</p>
              <Button asChild>
                <Link to="/community/question/new">{getTranslation(language, "askQuestion")}</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CommunityClassLevel;

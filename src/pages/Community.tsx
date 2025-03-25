
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  PlusCircle, 
  MessageCircle, 
  ThumbsUp, 
  CheckCircle, 
  Search, 
  BookOpen,
  School,
  Loader2,
  Pin,
} from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { getTranslation } from "@/utils/translations";
import { getQuestions } from '@/services/communityService';
import { Question } from '@/models/community';

const grades = ["9", "10", "11", "12"];

const Community = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const language = localStorage.getItem('language') || 'mn';

  useEffect(() => {
    const fetchQuestionsData = async () => {
      try {
        setLoading(true);
        const filters: any = {};
        
        if (selectedGrade !== 'all') {
          filters.grade = selectedGrade;
        }
        
        if (searchQuery) {
          filters.searchTerm = searchQuery;
        }
        
        const fetchedData = await getQuestions(filters);
        setQuestions(fetchedData.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast({
          title: getTranslation(language, "errorTitle"),
          description: getTranslation(language, "errorFetchingQuestions"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsData();
  }, [selectedGrade, toast, language]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const getFilteredQuestions = async () => {
        try {
          setLoading(true);
          const filters: any = {};
          
          if (selectedGrade !== 'all') {
            filters.grade = selectedGrade;
          }
          
          if (searchQuery) {
            filters.searchTerm = searchQuery;
          }
          
          const fetchedData = await getQuestions(filters);
          setQuestions(fetchedData.questions || []);
        } catch (error) {
          console.error("Error searching questions:", error);
        } finally {
          setLoading(false);
        }
      };
      
      getFilteredQuestions();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const renderQuestionCard = (question: Question) => {
    const createdAt = typeof question.createdAt === 'string' 
      ? new Date(question.createdAt) 
      : question.createdAt as Date;
    
    return (
      <Card key={question.id} className="mb-4 hover:shadow-md transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>
              <Link to={`/community/question/${question.id}`} className="hover:underline">
                {question.title}
              </Link>
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">{question.content}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {question.subject}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <School className="h-3 w-3" /> {getTranslation(language, "grade")} {question.grade}
            </Badge>
            {question.solved && (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                {getTranslation(language, "solved")}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback>{question.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {question.authorName} • {createdAt.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{question.upvotes || 0}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{getTranslation(language, "views")}: {question.views || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{getTranslation(language, "community")}</h1>
        </div>
        
        <div className="relative">
          <Input
            type="text"
            placeholder={getTranslation(language, "searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute top-2.5 right-3 h-5 w-5 text-muted-foreground" />
        </div>
        
        <Tabs defaultValue="all" className="mt-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all">{getTranslation(language, "Бүх")}</TabsTrigger>
                  <TabsTrigger value="open">{getTranslation(language, "Шийдэгдээгүй")}</TabsTrigger>
                  <TabsTrigger value="solved">{getTranslation(language, "Хаагдсан")}</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder={getTranslation(language, "classLevel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{getTranslation(language, "Анги")}</SelectItem>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {getTranslation(language, "grade")} {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="default" className="w-full sm:w-auto" asChild>
                    <Link to="/community/question/new">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {getTranslation(language, "askQuestion")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <section>
                    <TabsContent value="all" className="mt-0">
                      {questions.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-lg">
                          <p className="text-muted-foreground mb-4">{getTranslation(language, "noQuestionsFound")}</p>
                          <Button asChild>
                            <Link to="/community/question/new">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              {getTranslation(language, "askQuestion")}
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        questions.map(question => renderQuestionCard(question))
                      )}
                    </TabsContent>
                  </section>

                  <section className="mt-8">
                    <TabsContent value="open" className="mt-0">
                      {questions.filter(q => !q.solved).length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-lg">
                          <p className="text-muted-foreground">{getTranslation(language, "noOpenQuestionsFound")}</p>
                        </div>
                      ) : (
                        questions.filter(q => !q.solved).map(question => renderQuestionCard(question))
                      )}
                    </TabsContent>
                  </section>

                  <section className="mt-8">
                    <TabsContent value="solved" className="mt-0">
                      {questions.filter(q => q.solved).length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-lg">
                          <p className="text-muted-foreground">{getTranslation(language, "noSolvedQuestionsFound")}</p>
                        </div>
                      ) : (
                        questions.filter(q => q.solved).map(question => renderQuestionCard(question))
                      )}
                    </TabsContent>
                  </section>
                </>
              )}
            </div>
          </div>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Community;

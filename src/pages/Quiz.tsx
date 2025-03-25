import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BookText, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  Filter, 
  Award, 
  Trophy, 
  RefreshCw, 
  ChevronRight,
  Brain,
  Star,
  Flame,
  BookOpen,
  Users,
  Loader2,
  Trash2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { getTranslation } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { fetchQuizzes, fetchUserAttempts, deleteQuiz } from '@/services/quizService';
import { Quiz as QuizType } from '@/models/quiz';
import { auth } from '@/config/firebaseConfig';

const Quiz = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizType[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const language = localStorage.getItem('language') || 'mn';
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(isUserLoggedIn);
    };

    checkLoginStatus();

    // Fetch quizzes
    const fetchAllQuizzes = async () => {
      setLoading(true);

      try {
        const allQuizzes = await fetchQuizzes();
        const formattedQuizzes = allQuizzes.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title || '',
          subject: quiz.subject || '',
          grade: quiz.grade || '',
          questionCount: quiz.questionCount || 0,
          timeMinutes: quiz.timeMinutes || 0,
          createdBy: quiz.createdBy || 'Unknown',
          createdById: quiz.createdById || '',
          createdAt: quiz.createdAt || '',
          difficulty: quiz.difficulty || 'Medium',
          tags: quiz.tags || [],
          popularity: quiz.popularity || 0,
          photoURL: quiz.photoURL || '',
          description: quiz.description || '',
          visibility: quiz.visibility || 'public',
          questions: quiz.questions || [],
          pointsPerQuestion: quiz.pointsPerQuestion || 1,
          totalPoints: quiz.totalPoints || 0,
        }));
        setQuizzes(formattedQuizzes);

        // Fetch completed quizzes if user is logged in
        if (isLoggedIn && auth.currentUser) {
          const attempts = await fetchUserAttempts(auth.currentUser.uid);
          setUserAttempts(attempts);

          // Get completed quizzes based on attempts
          const completedQuizIds = new Set(attempts.map(attempt => attempt.quizId));
          const completed = formattedQuizzes.filter(quiz => completedQuizIds.has(quiz.id));
          setCompletedQuizzes(completed);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast({
          title: language === 'mn' ? 'Алдаа' : 'Error',
          description: language === 'mn' 
            ? 'Тестүүдийг авахад алдаа гарлаа' 
            : 'Failed to fetch quizzes',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, [isLoggedIn, toast, language]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const resetFilters = () => {
    setFilterSubject("");
    setFilterGrade("");
  };

  const handleStartQuiz = (id: string) => {
    if (!isLoggedIn) {
      toast({
        title: getTranslation(language, "loginRequired"),
        description: getTranslation(language, "loginToAccessQuizzes"),
      });
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
      return;
    }
    
    const selectedQuiz = quizzes.find(quiz => quiz.id === id);
    if (selectedQuiz) {
      navigate(`/quiz/${id}`);
    } else {
      toast({
        title: getTranslation(language, "quizNotFound"),
        description: getTranslation(language, "quizNotFoundDescription"),
        variant: 'destructive'
      });
    }
  };

  const subjects = [
    { value: "Математик", label: language === 'mn' ? 'Математик' : 'Mathematics' },
    { value: "Физик", label: language === 'mn' ? 'Физик' : 'Physics' },
    { value: "Хими", label: language === 'mn' ? 'Хими' : 'Chemistry' },
    { value: "Биологи", label: language === 'mn' ? 'Биологи' : 'Biology' },
    { value: "Түүх", label: language === 'mn' ? 'Түүх' : 'History' },
    { value: "Уран зохиол", label: language === 'mn' ? 'Уран зохиол' : 'Literature' },
  ];

  const grades = [
    { value: "6", label: language === 'mn' ? '6-р анги' : 'Grade 6' },
    { value: "7", label: language === 'mn' ? '7-р анги' : 'Grade 7' },
    { value: "8", label: language === 'mn' ? '8-р анги' : 'Grade 8' },
    { value: "9", label: language === 'mn' ? '9-р анги' : 'Grade 9' },
    { value: "10", label: language === 'mn' ? '10-р анги' : 'Grade 10' },
    { value: "11", label: language === 'mn' ? '11-р анги' : 'Grade 11' },
    { value: "12", label: language === 'mn' ? '12-р анги' : 'Grade 12' },
  ];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchValue.toLowerCase()) || 
                         quiz.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (quiz.tags && quiz.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase())));
    
    const matchesSubject = filterSubject ? quiz.subject === filterSubject : true;
    const matchesGrade = filterGrade ? quiz.grade === filterGrade : true;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Skill progress
  const calculateSkillProgress = () => {
    if (!userAttempts || userAttempts.length === 0) return [];
    
    // Group attempts by subject
    const subjectAttempts: Record<string, {total: number, correct: number}> = {};
    
    userAttempts.forEach(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      if (!quiz) return;
      
      if (!subjectAttempts[quiz.subject]) {
        subjectAttempts[quiz.subject] = { total: 0, correct: 0 };
      }
      
      // Count correct answers
      attempt.answers.forEach((answer: any) => {
        subjectAttempts[quiz.subject].total++;
        if (answer.isCorrect) {
          subjectAttempts[quiz.subject].correct++;
        }
      });
    });
    
    // Calculate percentage and convert to array
    return Object.entries(subjectAttempts).map(([subject, data]) => ({
      skill: subject,
      progress: Math.round((data.correct / data.total) * 100) || 0
    }));
  };
  
  const skillProgress = calculateSkillProgress();

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold">{getTranslation(language, "quizzes")}</h1>
              <p className="text-muted-foreground">
                {getTranslation(language, "testYourKnowledge")}
              </p>
            </div>
            {isLoggedIn && localStorage.getItem('isTeacher') === 'true' && (
              <Button onClick={() => navigate('/teacher')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                {getTranslation(language, "createNewQuiz")}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle>{getTranslation(language, "quizzes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs 
                    defaultValue="all" 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="space-y-4"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-4">
                      <TabsList>
                        <TabsTrigger value="all">{getTranslation(language, "allQuizzes")}</TabsTrigger>
                        <TabsTrigger value="recommended">{getTranslation(language, "recommended")}</TabsTrigger>
                        <TabsTrigger value="completed">{getTranslation(language, "completed")}</TabsTrigger>
                      </TabsList>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder={language === 'mn' ? "Тестүүдээс хайх..." : "Search quizzes..."}
                          value={searchValue}
                          onChange={handleSearch}
                          className="pl-9 w-full md:w-[300px]"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pb-4">
                      <div className="flex-1 min-w-[200px]">
                        <Select value={filterSubject} onValueChange={setFilterSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder={getTranslation(language, "subject")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'mn' ? 'Бүх хичээл' : 'All Subjects'}</SelectItem>
                            {subjects.map(subject => (
                              <SelectItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1 min-w-[200px]">
                        <Select value={filterGrade} onValueChange={setFilterGrade}>
                          <SelectTrigger>
                            <SelectValue placeholder={getTranslation(language, "classLevel")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'mn' ? 'Бүх ангиуд' : 'All Grades'}</SelectItem>
                            {grades.map(grade => (
                              <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(filterSubject || filterGrade) && (
                        <Button variant="ghost" onClick={resetFilters} className="flex-none">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {language === 'mn' ? 'Шүүлтүүр арилгах' : 'Clear Filters'}
                        </Button>
                      )}
                    </div>
                    
                    <TabsContent value="all" className="space-y-4 mt-0">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                      ) : filteredQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredQuizzes.map(quiz => (
                            <Card key={quiz.id} className="hover:shadow-md transition-all">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                  <Badge variant={
                                    quiz.difficulty === 'easy' ? 'outline' : 
                                    quiz.difficulty === 'medium' ? 'secondary' : 
                                    'destructive'
                                  }>
                                    {language === 'mn' ? 
                                      (quiz.difficulty === 'easy' ? 'Хялбар' : 
                                       quiz.difficulty === 'medium' ? 'Дунд' : 'Хүнд') : 
                                      quiz.difficulty
                                    }
                                  </Badge>
                                </div>
                                <CardDescription>
                                  <div>
                                    <span>{quiz.subject}</span>
                                  </div>
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                                  <div className="flex items-center">
                                    <BookText className="h-4 w-4 mr-1" />
                                    <span>{quiz.questionCount} {getTranslation(language, "questions")}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>{quiz.timeMinutes} {getTranslation(language, "minutes")}</span>
                                  </div>
                                </div>
                                {quiz.tags && quiz.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {quiz.tags.slice(0, 3).map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-primary/5 border-primary/20">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {quiz.tags.length > 3 && (
                                      <Badge variant="outline" className="bg-primary/5 border-primary/20">
                                        +{quiz.tags.length - 3}
                                      </Badge>
                                   )}
                                  </div>
                                )}
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span>{language === 'mn' ? 'Үүсгэсэн: ' : 'By: '}{quiz.createdBy}</span>
                                </div>
                              </CardContent>
                              <CardFooter className="pt-2">
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleStartQuiz(quiz.id)}
                                >
                                  {getTranslation(language, "startQuiz")}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border rounded-lg">
                          <BookText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">{getTranslation(language, "noQuizzesFound")}</h3>
                          <p className="text-muted-foreground mt-2 mb-6">
                            {getTranslation(language, "tryDifferentFilters")}
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {filterSubject && (
                              <Button variant="outline" onClick={() => setFilterSubject("")}>
                                {getTranslation(language, "resetSubject")}
                              </Button>
                            )}
                            {filterGrade && (
                              <Button variant="outline" onClick={() => setFilterGrade("")}>
                                {getTranslation(language, "resetGrade")}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="recommended" className="space-y-4 mt-0">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Top recommended quizzes */}
                          {filteredQuizzes
                            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                            .slice(0, 4)
                            .map(quiz => (
                            <Card key={quiz.id} className="hover:shadow-md transition-all">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                  <Badge variant={
                                    quiz.difficulty === 'easy' ? 'outline' : 
                                    quiz.difficulty === 'medium' ? 'secondary' : 
                                    'destructive'
                                  }>
                                    {language === 'mn' ? 
                                      (quiz.difficulty === 'easy' ? 'Хялбар' : 
                                       quiz.difficulty === 'medium' ? 'Дунд' : 'Хүнд') : 
                                      quiz.difficulty
                                    }
                                  </Badge>
                                </div>
                                <CardDescription>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span>{quiz.subject}</span>
                                  </div>
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                                  <div className="flex items-center">
                                    <BookText className="h-4 w-4 mr-1" />
                                    <span>{quiz.questionCount} {getTranslation(language, "questions")}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Flame className="h-4 w-4 mr-1 text-red-500" />
                                    <span className="text-red-500 font-medium">
                                      {language === 'mn' ? 'Түгээмэл' : 'Popular'}
                                    </span>
                                  </div>
                                </div>
                                {quiz.tags && quiz.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {quiz.tags.slice(0, 3).map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-primary/5 border-primary/20">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span>{language === 'mn' ? 'Үүсгэсэн: ' : 'By: '}{quiz.createdBy}</span>
                                </div>
                              </CardContent>
                              <CardFooter className="pt-2">
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleStartQuiz(quiz.id)}
                                >
                                  {getTranslation(language, "startQuiz")}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="completed" className="space-y-4 mt-0">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                      ) : completedQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {completedQuizzes.map(quiz => {
                            // Find the most recent attempt for this quiz
                            const attempt = userAttempts
                              .filter(a => a.quizId === quiz.id)
                              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
                            
                            const score = attempt ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
                            
                            return (
                              <Card key={quiz.id} className="hover:shadow-md transition-all">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                      {score}%
                                    </Badge>
                                  </div>
                                  <CardDescription>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <span>{quiz.subject}</span>
                                    </div>
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center">
                                      <BookText className="h-4 w-4 mr-1" />
                                      <span>{quiz.questionCount} {getTranslation(language, "questions")}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                      <span className="text-green-500">
                                        {language === 'mn' ? 'Дууссан' : 'Completed'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                      <span className="text-muted-foreground">
                                        {language === 'mn' ? 'Оноо' : 'Score'}
                                      </span>
                                      <span className="font-medium">{score}%</span>
                                    </div>
                                    <Progress 
                                      value={score} 
                                      className={`h-1.5 ${
                                        score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
                                      }`}
                                    />
                                  </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                  <Button 
                                    className="w-full" 
                                    variant="outline"
                                    onClick={() => handleStartQuiz(quiz.id)}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {getTranslation(language, "retake")}
                                  </Button>
                                </CardFooter>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 border rounded-lg">
                          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">
                            {getTranslation(language, "noCompletedQuizzes")}
                          </h3>
                          <p className="text-muted-foreground mt-2 mb-6">
                            {getTranslation(language, "startQuizToTrack")}
                          </p>
                          <Button 
                            onClick={() => setActiveTab("all")}
                          >
                            {getTranslation(language, "browseQuizzes")}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* User Progress */}
              {isLoggedIn && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                      {language === 'mn' ? 'Миний хөгжил' : 'My Progress'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-end mb-2">
                        <h4 className="font-medium">{getTranslation(language, "quizzesTaken")}</h4>
                        <span className="text-2xl font-bold">{userAttempts.length}</span>
                      </div>
                      
                      {userAttempts.length > 0 && (
                        <>
                          <div className="flex justify-between items-end mb-2">
                            <h4 className="font-medium">{getTranslation(language, "average")}</h4>
                            <span className="text-2xl font-bold text-green-600">
                              {Math.round(
                                userAttempts.reduce((total, attempt) => 
                                  total + (attempt.score / attempt.totalQuestions * 100), 0) / userAttempts.length
                              )}%
                            </span>
                          </div>
                          
                          {/* Show favorite subject based on performance */}
                          {skillProgress.length > 0 && (
                            <div className="flex justify-between items-end">
                              <h4 className="font-medium">{getTranslation(language, "favoriteSubject")}</h4>
                              <span className="font-medium">
                                {skillProgress.sort((a, b) => b.progress - a.progress)[0].skill}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {skillProgress.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-3">
                          {language === 'mn' ? 'Хичээлийн түвшин' : 'Subject Performance'}
                        </h4>
                        <ScrollArea className="h-40 overflow-auto pr-4">
                          <div className="space-y-4">
                            {skillProgress.map((item, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">{item.skill}</span>
                                  <span className="text-sm font-medium">{item.progress}%</span>
                                </div>
                                <Progress 
                                  value={item.progress} 
                                  className={`h-2 ${
                                    item.progress >= 80 ? "bg-green-500" : 
                                    item.progress >= 60 ? "bg-amber-500" : 
                                    "bg-red-500"
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : userAttempts.length > 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        {language === 'mn' 
                          ? 'Хичээлийн түвшин харуулахын тулд илүү олон тест өгнө үү' 
                          : 'Take more quizzes to see your subject performance'
                        }
                      </div>
                    ) : null}
                    
                    <div className="pt-4 border-t mt-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/rankings">
                          <Star className="mr-2 h-4 w-4 text-amber-500" />
                          {language === 'mn' ? 'Чансаа харах' : 'View Rankings'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Popular Categories */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                    {language === 'mn' ? 'Ангилалууд' : 'Categories'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {subjects.map((subject, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="justify-between text-left"
                        onClick={() => setFilterSubject(subject.value)}
                      >
                        <span>{subject.label}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Featured Quiz */}
              {quizzes.length > 0 && (
                <Card className="shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                    <h3 className="font-bold text-lg mb-1">
                      {language === 'mn' ? 'Онцлох тест' : 'Featured Quiz'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'mn' ? 'Өнөөдрийн онцлох тест' : 'Daily featured quiz'}
                    </p>
                  </div>
                  <CardContent className="p-4">
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium mb-2">
                          {quizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]?.title}
                        </h4>
                        <div className="flex justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <BookText className="h-4 w-4 mr-1" />
                            <span>
                              {quizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]?.questionCount} {getTranslation(language, "questions")}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>
                              {quizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]?.popularity || 0} {getTranslation(language, "participants")}
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-2" 
                          onClick={() => handleStartQuiz(quizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]?.id)}
                        >
                          {getTranslation(language, "tryNow")}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;

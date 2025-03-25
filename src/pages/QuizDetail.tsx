import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookText, ChevronLeft, Clock, CheckCircle, XCircle, AlertTriangle, Trophy } from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';
import { getTranslation } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { getQuiz } from '@/services/quizService'; // Import the getQuiz function
import { Quiz } from '@/models/quiz'; // Import the Quiz type from the models

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
}

const QuizDetail = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null); // Use the imported Quiz type
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // Change key type to string
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();
  const language = localStorage.getItem('language') || 'mn';

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      toast({
        title: getTranslation(language, "loginRequired"),
        description: getTranslation(language, "loginToAccessQuizzes"),
      });
      navigate('/auth');
      return;
    }

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const fetchedQuiz = await getQuiz(quizId || '');
        setQuiz(fetchedQuiz);
        setTimeLeft(fetchedQuiz.timeMinutes * 60);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: getTranslation(language, "error"),
          description: getTranslation(language, "quizNotFoundDescription"),
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, navigate, toast, language]);

  useEffect(() => {
    if (!quizStarted || !timeLeft || quizSubmitted) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [quizStarted, timeLeft, quizSubmitted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => { // Change parameter type to string
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correctOptionId) { // Ensure correct comparison
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    
    setScore({
      correct: correctCount,
      total: quiz.questions.length,
      percentage
    });
    
    setQuizSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">{getTranslation(language, "loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-12 border rounded-lg">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium">{getTranslation(language, "quizNotFound")}</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              {getTranslation(language, "quizNotFoundDescription")}
            </p>
            <Button asChild>
              <Link to="/quiz">{getTranslation(language, "backToQuizzes")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  // Results page
  if (quizSubmitted) {
    const isPass = score.percentage >= 60;
    
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/quiz">
                <ChevronLeft className="h-4 w-4 mr-2" />
                {getTranslation(language, "Тест рүү буцах")}
              </Link>
            </Button>
            
            <Card className="shadow-md">
              <CardHeader className="pb-3 text-center">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <CardDescription className="flex justify-center gap-2 mt-2">
                  <Badge variant="secondary">{quiz.subject}</Badge>
                  <Badge variant="outline">
                    {language === 'mn' ? 'Анги ' : 'Grade '}{quiz.grade}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center pt-4">
                  <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{score.percentage}%</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {score.correct}/{score.total} {getTranslation(language, "correct")}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  {isPass ? (
                    <div>
                      <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                      <h3 className="text-xl font-bold text-green-600 mb-1">
                        {getTranslation(language, "passed")}
                      </h3>
                      <p className="text-muted-foreground">
                        {getTranslation(language, "quizPassedMessage")}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <XCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
                      <h3 className="text-xl font-bold text-red-600 mb-1">
                        {getTranslation(language, "notPassed")}
                      </h3>
                      <p className="text-muted-foreground">
                        {getTranslation(language, "quizNotPassedMessage")}
                      </p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">{getTranslation(language, "Тестийн дүн")}</h3>
                  
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = userAnswer === question.correctOptionId;
                    const correctOptionText = question.options.find(option => option.id === question.correctOptionId)?.text || '';
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{getTranslation(language, "question")} {index + 1}</div>
                          {userAnswer && (
                            <Badge className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {isCorrect ? getTranslation(language, "Зөв") : getTranslation(language, "Буруу")}
                            </Badge>
                          )}
                        </div>
                        <p className="mb-3">{question.text}</p>
                        
                        <div className="space-y-2">
                          {question.options.map(option => {
                            const isSelected = userAnswer === option.id;
                            const isCorrectOption = option.id === question.correctOptionId;
                            
                            // Determine style
                            let optionStyle = "border rounded-md p-2 flex items-center";
                            
                            if (isSelected && isCorrectOption) {
                              optionStyle += " bg-green-100 border-green-500 text-green-800";
                            } else if (isSelected && !isCorrectOption) {
                              optionStyle += " bg-red-100 border-red-500 text-red-800";
                            } else if (isCorrectOption) {
                              optionStyle += " bg-green-50 border-green-300 text-green-800";
                            } else {
                              optionStyle += " bg-background";
                            }
                            
                            return (
                              <div key={option.id} className={optionStyle}>
                                <div>{option.text}</div>
                                {isSelected && !isCorrectOption && (
                                  <XCircle className="ml-auto h-5 w-5 text-red-500" />
                                )}
                                {isCorrectOption && (
                                  <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to="/quiz">{getTranslation(language, "backToQuizzes")}</Link>
                </Button>
                <Button onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setQuizSubmitted(false);
                  setQuizStarted(false);
                  setTimeLeft(quiz.timeMinutes * 60);
                }}>
                  {getTranslation(language, "retake")}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Start page
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/quiz">
                <ChevronLeft className="h-4 w-4 mr-2" />
                {getTranslation(language, "Тест рүү буцах")}
              </Link>
            </Button>
            
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{quiz.subject}</Badge>
                  <Badge variant="outline">
                    {language === 'mn' ? 'Анги ' : 'Grade '}{quiz.grade}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>{quiz.description}</p>
                
                <div className="space-y-4 border-t border-b py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <BookText className="h-5 w-5 mr-2 text-indigo-500" />
                      <span className="font-medium">{getTranslation(language, "questions")}</span>
                    </div>
                    <span>{quiz.questions.length} {getTranslation(language, "questions")}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                      <span className="font-medium">{getTranslation(language, "Хугацаа")}</span>
                    </div>
                    <span>{quiz.timeMinutes} {getTranslation(language, "minutes")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleStartQuiz} size="lg">
                  {getTranslation(language, "startQuiz")}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-red-500" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{getTranslation(language, "question")} {currentQuestionIndex + 1} / {quiz.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestionIndex + 1}. {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={answers[currentQuestion.id]} 
                onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} className="peer" />
                    <Label 
                      htmlFor={`option-${option.id}`} 
                      className="flex-1 cursor-pointer peer-data-[state=checked]:font-medium"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                {getTranslation(language, "previous")}
              </Button>
              
              <div className="flex gap-3">
                {isLastQuestion ? (
                  <Button 
                    onClick={handleSubmitQuiz} 
                    disabled={Object.keys(answers).length < quiz.questions.length}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {getTranslation(language, "Тестийг илгээх")}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion} 
                    disabled={!isAnswered}
                  >
                    {getTranslation(language, "next")}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-1 flex-wrap">
              {quiz.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={answers[quiz.questions[index].id] !== undefined ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${currentQuestionIndex === index ? "border-primary" : ""}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length < 1}
            >
              {getTranslation(language, "Тестийг дуусгах")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizDetail;

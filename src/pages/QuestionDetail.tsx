import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  MessageCircle, 
  Calendar, 
  Eye,
  Pin,
  Loader2,
  Flag,
  Trash2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { getTranslation } from "@/utils/translations";
import { 
  getQuestionById as fetchQuestionById, // updated import
  getAnswers as fetchAnswersForQuestion,
  createAnswer,
  updateQuestionStatus as markQuestionAsSolved,
  updateAnswerVote as handleVote,
  removeQuestion as deleteQuestion,
  removeAnswer as deleteAnswer
} from '@/services/communityService';
import { Question, Answer } from '@/models/community';
import { Input } from "@/components/ui/input";

const QuestionDetail = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const language = localStorage.getItem('language') || 'mn';

  useEffect(() => {
    const checkLoginStatus = () => {
      const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const storedUserData = localStorage.getItem('userData');
      
      setIsLoggedIn(isUserLoggedIn);
      
      if (storedUserData) {
        try {
          setUserData(JSON.parse(storedUserData));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        
        const fetchedQuestion = await fetchQuestionById(questionId);
        if (fetchedQuestion) {
          setQuestion({
            ...fetchedQuestion,
            solved: Boolean(fetchedQuestion.solved), // Ensure solved is a boolean
          });
        }
        
        const fetchedAnswers = await fetchAnswersForQuestion(questionId);
        if (fetchedAnswers) {
          setAnswers(fetchedAnswers);
        }
      } catch (error) {
        console.error('Error fetching question details:', error);
        toast({
          title: getTranslation(language, "errorTitle"),
          description: getTranslation(language, "errorFetchingQuestionDetails"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [questionId, navigate, toast, language]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedFile(event.target.files[0]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!questionId || !answerContent.trim() || !isLoggedIn || !userData) {
      if (!isLoggedIn) {
        toast({
          title: getTranslation(language, "loginRequired"),
          description: getTranslation(language, "loginRequiredToAnswer"),
          variant: "destructive",
        });
        navigate('/auth');
      }
      return;
    }

    try {
      setIsSubmitting(true);

      const newAnswer = {
        questionId,
        content: answerContent,
        authorId: userData.uid,
        authorName: userData.displayName || 'Anonymous',
        votes: 0, // Initialize votes to 0
      };

      const answerId = await createAnswer(questionId, newAnswer); // Ensure both arguments are passed

      const updatedAnswers = await fetchAnswersForQuestion(questionId);
      setAnswers(updatedAnswers);

      setAnswerContent('');
      setUploadedFile(null);

      toast({
        title: getTranslation(language, "answerPosted"),
        description: getTranslation(language, "answerPostedSuccess"),
      });
    } catch (error) {
      console.error('Error posting answer:', error);
      toast({
        title: getTranslation(language, "errorTitle"),
        description: getTranslation(language, "errorPostingAnswer"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsSolved = async (answerId: string) => {
    if (!questionId || !answerId) return;
    
    try {
      await markQuestionAsSolved(questionId, true);
      
      if (question) {
        setQuestion({ ...question, solved: true });
      }
      
      toast({
        title: getTranslation(language, "questionMarkedAsSolved"),
        description: getTranslation(language, "questionMarkedAsSolvedSuccess"),
      });
    } catch (error) {
      console.error('Error marking question as solved:', error);
      toast({
        title: getTranslation(language, "errorTitle"),
        description: getTranslation(language, "errorMarkingAsSolved"),
        variant: "destructive",
      });
    }
  };

  const upvoteAnswer = async (answerId: string): Promise<void> => {
    if (!userData?.uid) return;
    try {
      await handleVote(questionId, answerId, userData.uid, true);
      setAnswers(prevAnswers => prevAnswers.map(answer => 
        answer.id === answerId ? { ...answer, votes: answer.votes + (answer.votes === 1 ? -1 : 1) } : answer
      ));
    } catch (error) {
      console.error('Error upvoting answer:', error);
    }
  };

  const downvoteAnswer = async (answerId: string): Promise<void> => {
    if (!userData?.uid) return;
    try {
      await handleVote(questionId, answerId, userData.uid, false);
      setAnswers(prevAnswers => prevAnswers.map(answer => 
        answer.id === answerId ? { ...answer, votes: answer.votes + (answer.votes === -1 ? 1 : -1) } : answer
      ));
    } catch (error) {
      console.error('Error downvoting answer:', error);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionId || !isQuestionAuthor) return;
  
    try {
      await deleteQuestion(questionId);
      toast({
        title: getTranslation(language, "questionDeleted"),
        description: getTranslation(language, "questionDeletedSuccess"),
      });
      navigate('/community');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: getTranslation(language, "errorTitle"),
        description: getTranslation(language, "errorDeletingQuestion"),
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAnswer = async (answerId: string) => {
    if (!isQuestionAuthor) return;
  
    try {
      await deleteAnswer(answerId, questionId);
      const updatedAnswers = answers.filter(answer => answer.id !== answerId);
      setAnswers(updatedAnswers);
      toast({
        title: getTranslation(language, "answerDeleted"),
        description: getTranslation(language, "answerDeletedSuccess"),
      });
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast({
        title: getTranslation(language, "errorTitle"),
        description: getTranslation(language, "errorDeletingAnswer"),
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(language === 'mn' ? 'mn-MN' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto px-4 pt-24 pb-16 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold mb-4">{getTranslation(language, "questionNotFound")}</h2>
            <p className="mb-6 text-muted-foreground">{getTranslation(language, "questionNotFoundDesc")}</p>
            <Button onClick={() => navigate('/community')}>
              {getTranslation(language, "backToCommunity")}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isQuestionAuthor = userData?.uid === question.authorId;

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/community')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getTranslation(language, "backToCommunity")}
          </Button>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">
                    {question.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {question.subject}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTranslation(language, "grade")} {question.grade}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(question.createdAt)}
                    </Badge>
                    {question.solved && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {getTranslation(language, "solved")}
                      </Badge>
                    )}
                  </div>
                </div>
                {isQuestionAuthor && (
                  <Button variant="ghost" size="sm" onClick={handleDeleteQuestion}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{question.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{question.authorName}</p>
                  <p className="whitespace-pre-wrap">{question.content}</p>
                  
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {question.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {getTranslation(language, "answers")} ({answers.length})
            </h2>
            
            {answers.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <MessageCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{getTranslation(language, "noAnswersYet")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer) => (
                  <Card key={answer.id} className={`${question.solved ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => upvoteAnswer(answer.id)}
                            disabled={!isLoggedIn}
                          >
                            <ThumbsUp className="h-5 w-5" />
                          </Button>
                          <span className="text-center my-1">{answer.votes}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downvoteAnswer(answer.id)}
                            disabled={!isLoggedIn}
                          >
                            <ThumbsDown className="h-5 w-5" />
                          </Button>
                          
                          {isQuestionAuthor && !question.solved && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="mt-3">
                                  <CheckCircle className="h-5 w-5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{getTranslation(language, "markAsSolution")}</DialogTitle>
                                  <DialogDescription>
                                    {getTranslation(language, "markAsSolutionDesc")}
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">{getTranslation(language, "cancel")}</Button>
                                  </DialogClose>
                                  <Button onClick={() => handleMarkAsSolved(answer.id)}>{getTranslation(language, "confirm")}</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>{answer.authorName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{answer.authorName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(answer.createdAt)}
                                </p>
                              </div>
                            </div>
                            {isQuestionAuthor && (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAnswer(answer.id)}>
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            )}
                            {question.solved && (
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {getTranslation(language, "accepted")}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-2">
                            <p className="whitespace-pre-wrap">{answer.content}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {!question.solved && (
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation(language, "yourAnswer")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoggedIn ? (
                  <div>
                    <Textarea 
                      placeholder={getTranslation(language, "writeYourAnswer")}
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      className="min-h-[150px] mb-4"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={isSubmitting || !answerContent.trim()}
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {getTranslation(language, "postAnswer")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p className="mb-4">{getTranslation(language, "loginToAnswer")}</p>
                    <Button asChild>
                      <Link to="/auth">{getTranslation(language, "login")}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuestionDetail;

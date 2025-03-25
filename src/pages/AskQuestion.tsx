import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { getTranslation } from '@/utils/translations';
import { createQuestion } from '@/services/communityService';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Question content must be at least 20 characters'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
});

const subjects = [
  { value: 'math', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'literature', label: 'Literature' },
  { value: 'english', label: 'English' },
  { value: 'programming', label: 'Programming' },
  { value: 'other', label: 'Other' }
];

const grades = ['9', '10', '11', '12'];

const AskQuestion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const language = localStorage.getItem('language') || 'mn';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      subject: '',
      grade: '',
    },
  });

  useEffect(() => {
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
    
    if (!isUserLoggedIn) {
      toast({
        title: getTranslation(language, "loginRequired"),
        description: getTranslation(language, "loginRequiredToAskQuestion"),
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [navigate, toast, language]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isLoggedIn || !userData) {
      toast({
        title: getTranslation(language, "loginRequired"),
        description: getTranslation(language, "loginRequiredToAskQuestion"),
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      setIsSubmitting(true);

      const newQuestion = {
        title: values.title,
        content: values.content,
        subject: values.subject,
        grade: values.grade,
        authorId: userData.uid,
        authorName: userData.displayName || 'Anonymous',
        authorPhotoURL: userData.photoURL,
        tags: [],
        updatedAt: new Date().toISOString(),
        solved: false,
        viewCount: 0
      };

      const questionId = await createQuestion(newQuestion);

      toast({
        title: getTranslation(language, "questionPosted"),
        description: getTranslation(language, "questionPostedSuccess"),
      });

      navigate(`/community/question/${questionId}`);
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: getTranslation(language, "errorTitle"),
        description: getTranslation(language, "errorPostingQuestion"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getTranslation(language, "back")}
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {getTranslation(language, "askQuestion")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {getTranslation(language, "questionTitle")}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={getTranslation(language, "questionTitlePlaceholder")} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {getTranslation(language, "subject")}
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={getTranslation(language, "selectSubject")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {getTranslation(language, "grade")}
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={getTranslation(language, "selectGrade")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {grades.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {getTranslation(language, "grade")} {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base mb-2 block">
                          {getTranslation(language, "questionDetails")}
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={getTranslation(language, "questionDetailsPlaceholder")} 
                            className="min-h-[200px] mt-2"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {getTranslation(language, "postQuestion")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AskQuestion;

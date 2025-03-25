import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Trash, 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  FileQuestion,
  ChevronLeft, 
  ChevronRight,
  Info,
  Globe,
  Lock,
  Users,
  Timer,
  Edit // Added Edit icon
} from 'lucide-react';
import { getTranslation } from "@/utils/translations";
import { auth } from '@/config/firebaseConfig';
import { uploadFile } from '@/services/fileService';
import { createQuiz } from '@/services/quizService';
import { Quiz, QuizVisibility } from '@/models/quiz';

interface CreateQuizProps {
  language: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  correctAnswer: string; // Ensure correctAnswer is included
  explanation?: string;
}

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const CreateQuiz: React.FC<CreateQuizProps> = ({ language }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Basic Info (Step 1)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [visibility, setVisibility] = useState<QuizVisibility>(QuizVisibility.Private);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(10);
  
  // Questions (Step 2)
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: generateUniqueId(), text: '' },
    { id: generateUniqueId(), text: '' },
    { id: generateUniqueId(), text: '' },
    { id: generateUniqueId(), text: '' }
  ]);
  const [correctOptionId, setCorrectOptionId] = useState('');
  const [explanation, setExplanation] = useState('');
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  
  // Calculate total quiz points
  const totalPoints = questions.length * pointsPerQuestion;
  
  const resetQuestionForm = () => {
    setQuestionText('');
    setOptions([
      { id: generateUniqueId(), text: '' },
      { id: generateUniqueId(), text: '' },
      { id: generateUniqueId(), text: '' },
      { id: generateUniqueId(), text: '' }
    ]);
    setCorrectOptionId('');
    setExplanation('');
    setQuestionImage(null);
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: generateUniqueId(), text: '' }]);
    }
  };
  
  const handleRemoveOption = (idToRemove: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== idToRemove));
      if (correctOptionId === idToRemove) {
        setCorrectOptionId('');
      }
    }
  };
  
  const handleOptionChange = (id: string, value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text: value } : option
    ));
  };
  
  const handleSaveQuestion = () => {
    // Validate question
    if (!questionText.trim()) {
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Асуулт оруулах шаардлагатай'),
        variant: 'destructive'
      });
      return;
    }
    
    // Validate options
    const emptyOptions = options.filter(option => !option.text.trim());
    if (emptyOptions.length > 0) {
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Хариулт оруулах шаардлагатай'),
        variant: 'destructive'
      });
      return;
    }
    
    // Validate correct answer
    if (!correctOptionId) {
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Зөв хариулт сонгоно уу'),
        variant: 'destructive'
      });
      return;
    }
    
    const newQuestion: QuizQuestion = {
      id: generateUniqueId(),
      text: questionText,
      options: options,
      correctOptionId: correctOptionId,
      correctAnswer: options.find(option => option.id === correctOptionId)?.text || '', // Ensure correctAnswer is included
      explanation: explanation || undefined,
    };
    
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      if (currentQuestionIndex < prevQuestions.length) {
        // Update existing question
        updatedQuestions[currentQuestionIndex] = newQuestion;
      } else {
        // Add new question
        updatedQuestions.push(newQuestion);
      }
      return updatedQuestions;
    });
  
    resetQuestionForm();
    
    // Move to the next question
    setCurrentQuestionIndex(questions.length);
    
    toast({
      title: getTranslation(language, 'success'),
      description: getTranslation(language, 'questionSaved')
    });
  };
  
  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setCurrentQuestionIndex(index);
    setQuestionText(question.text);
    setOptions(question.options);
    setCorrectOptionId(question.correctOptionId);
    setExplanation(question.explanation || '');
  };
  
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    
    // Reset form if the current question is removed
    if (index === currentQuestionIndex) {
      resetQuestionForm();
    }
    
    // Adjust current index if needed
    if (index < currentQuestionIndex) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const fileUrl = await uploadFile(file, 'quiz-images'); // Upload file to Firebase
      setQuestionImage(fileUrl.url); // Save only the URL string to the question
      toast({
        title: getTranslation(language, 'Амжилттай'),
        description: getTranslation(language, 'Файл амжилттай байршлаа'),
      });
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Файл байршуулахад алдаа гарлаа'),
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleCreateQuiz = async () => {
    try {
      // Validate Step 1
      if (!title.trim() || !subject.trim() || !grade.trim()) {
        toast({
          title: getTranslation(language, 'Алдаа'),
          description: getTranslation(language, 'Шаардлагатай талбаруудыг бөглөнө үү'),
          variant: 'destructive'
        });
        setStep(1);
        return;
      }
      
      // Validate Step 2
      if (questions.length === 0) {
        toast({
          title: getTranslation(language, 'Алдаа'),
          description: getTranslation(language, 'Ядаж нэг асуулт оруулна уу'),
          variant: 'destructive'
        });
        return;
      }
      
      setLoading(true);
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа');
      }
      
      const quizData: Omit<Quiz, 'id' | 'createdAt'> = {
        title,
        description,
        subject,
        grade,
        difficulty,
        tags,
        timeMinutes: timeLimit,
        questionCount: questions.length,
        createdBy: user.displayName || 'Anonymous Teacher',
        createdById: user.uid,
        visibility,
        questions: [...questions], // Ensure all questions are passed
        pointsPerQuestion,
        totalPoints,
        updatedAt: new Date().toISOString()
      };
      
      const quizId = await createQuiz(quizData); // Get the quiz ID
      
      toast({
        title: getTranslation(language, 'Амжилттай'),
        description: getTranslation(language, 'Тест амжилттай үүсгэгдлээ'),
      });
      
      navigate(`/quiz/${quizId}`); // Navigate to the created quiz
    } catch (error) {
      console.error('Тест үүсгэхэд алдаа гарлаа:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Тест үүсгэхэд алдаа гарлаа'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {getTranslation(language, 'Тест үүсгэх')}
        </h1>
        <div className="flex items-center text-sm text-muted-foreground">
          {getTranslation(language, 'Алхам')} 2 {getTranslation(language, 'оос')} {step}
        </div>
      </div>
      
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation(language, 'Сорилийн мэдээлэл')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">
                {getTranslation(language, 'Гарчиг')}
              </Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getTranslation(language, 'Тестийн нэрийг оруулна уу')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                {getTranslation(language, 'Тайлбар')}
              </Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder={getTranslation(language, 'Тайлбарыг оруулна уу')}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="required">
                  {getTranslation(language, 'Хичээл')}
                </Label>
                <Input 
                  id="subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={getTranslation(language, 'Хичээлийн нэрийг оруулна уу')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade" className="required">
                  {getTranslation(language, 'grade')}
                </Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder={getTranslation(language, 'selectGrade')} />
                  </SelectTrigger>
                  <SelectContent>
                    {['9', '10', '11', '12'].map((g) => (
                      <SelectItem key={g} value={g}>
                        {getTranslation(language, 'grade')} {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">
                  {getTranslation(language, 'Түвшин')}
                </Label>
                <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={getTranslation(language, 'Амархан')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{getTranslation(language, 'Амархан')}</SelectItem>
                    <SelectItem value="medium">{getTranslation(language, 'Дундаж')}</SelectItem>
                    <SelectItem value="hard">{getTranslation(language, 'Хүнд')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-limit">
                  {getTranslation(language, 'Хугацаа')} (Минутаар)
                </Label>
                <div className="flex items-center">
                  <Input 
                    id="time-limit" 
                    type="number"
                    min={1}
                    max={180}
                    value={timeLimit} 
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                  />
                  <Timer className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points">
                {getTranslation(language, 'Асуулт бүрт ногдох оноо')} ({getTranslation(language, '1-100')})
              </Label>
              <Input 
                id="points" 
                type="number"
                min={1}
                max={100}
                value={pointsPerQuestion} 
                onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                {getTranslation(language, 'Нийт оноо')}: {totalPoints}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer ${
                    visibility === QuizVisibility.Public ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                  onClick={() => setVisibility(QuizVisibility.Public)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="h-5 w-5" />
                    {visibility === QuizVisibility.Public && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <h3 className="font-medium">{getTranslation(language, 'Нээлттэй')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTranslation(language, 'Нээлттэй тест')}
                  </p>
                </div>
                
                <div
                  className={`p-4 rounded-lg border cursor-pointer ${
                    visibility === QuizVisibility.Private ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                  onClick={() => setVisibility(QuizVisibility.Private)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Lock className="h-5 w-5" />
                    {visibility === QuizVisibility.Private && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <h3 className="font-medium">{getTranslation(language, 'Нууцлалтай')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTranslation(language, 'Нууцлалттай тест')}
                  </p>
                </div>
                
                <div
                  className={`p-4 rounded-lg border cursor-pointer ${
                    visibility === QuizVisibility.Class ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                  onClick={() => setVisibility(QuizVisibility.Class)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5" />
                    {visibility === QuizVisibility.Class && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <h3 className="font-medium">{getTranslation(language, 'Анги Доторх')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTranslation(language, 'Анги доторх тест')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              {getTranslation(language, 'Цуцлах')}
            </Button>
            <Button onClick={() => setStep(2)}>
              {getTranslation(language, 'Дараагийнх')}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 2 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {getTranslation(language, 'Асуулт нэмэх')}
                <span className="ml-2 text-muted-foreground text-sm font-normal">
                  {questions.length} {getTranslation(language, 'Асуулт нэмэгдсэн')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question-text" className="required">
                  {getTranslation(language, 'Асуулт')}
                </Label>
                <Textarea 
                  id="question-text" 
                  value={questionText} 
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={getTranslation(language, 'Асуултыг оруулна уу')}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="required">
                    {getTranslation(language, 'Сонголтууд')}
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddOption}
                    disabled={options.length >= 6}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {getTranslation(language, 'Сонголт нэмэх')}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Input 
                            value={option.text} 
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            placeholder={`${getTranslation(language, 'Сонголт')} ${index + 1}`}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCorrectOptionId(option.id)}
                        className={`rounded-full w-6 h-6 ${
                          correctOptionId === option.id 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {correctOptionId === option.id && <Check className="h-3 w-3" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(option.id)}
                        disabled={options.length <= 2}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="explanation">
                  {getTranslation(language, 'Тайлбар')} ({getTranslation(language, 'Шаардлагатай')})
                </Label>
                <Textarea 
                  id="explanation" 
                  value={explanation} 
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={getTranslation(language, 'Тайлбарыг оруулна уу')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{getTranslation(language, 'Файл байршуулах')}</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="*/*" 
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
                {questionImage && (
                  <div className="mt-2">
                    <a href={questionImage} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {getTranslation(language, 'Файлыг харах')}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveQuestion}>
                  {currentQuestionIndex < questions.length
                    ? getTranslation(language, 'Асуулт шинэчлэх')
                    : getTranslation(language, 'Асуулт нэмэх')
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {questions.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{getTranslation(language, 'questions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div 
                      key={question.id}
                      className={`p-4 border rounded-lg ${
                        index === currentQuestionIndex ? 'border-primary' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {index + 1}. {question.text}
                        </h3>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditQuestion(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveQuestion(index)}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {question.options.map(option => (
                          <div 
                            key={option.id}
                            className={`p-2 border rounded ${
                              option.id === question.correctOptionId 
                                ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                                : ''
                            }`}
                          >
                            {option.text}
                            {option.id === question.correctOptionId && (
                              <Check className="inline-block h-4 w-4 ml-1 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {getTranslation(language, 'Буцах')}
            </Button>
            <Button 
              onClick={handleCreateQuiz}
              disabled={questions.length === 0 || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileQuestion className="h-4 w-4 mr-2" />
              )}
              {getTranslation(language, 'createQuiz')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateQuiz;

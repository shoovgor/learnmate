
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  BookText, 
  Users, 
  LineChart,
  CheckCircle,
  PlusCircle, 
  Trash2, 
  Save 
} from 'lucide-react';
import { getTranslation } from "@/utils/translations";
import { useToast } from "@/components/ui/use-toast";

interface TeacherPanelProps {
  language: string;
}

const TeacherPanel: React.FC<TeacherPanelProps> = ({ language }) => {
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [quizClass, setQuizClass] = useState('');
  const [hasPrize, setHasPrize] = useState(false);
  const [prizeDescription, setPrizeDescription] = useState('');
  
  const { toast } = useToast();

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const updateCorrectAnswer = (questionIndex: number, value: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = value;
    setQuestions(updatedQuestions);
  };

  const saveQuiz = () => {
    // In a real app, this would send the quiz to a backend
    console.log({
      title: quizTitle,
      subject: quizSubject,
      class: quizClass,
      hasPrize,
      prizeDescription,
      questions
    });
    
    toast({
      title: getTranslation(language, "quizSaved"),
      description: getTranslation(language, "quizSavedDescription"),
      action: (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ),
    });
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">{getTranslation(language, "teacherPanel")}</h1>
      
      <Tabs defaultValue="createQuiz">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="createQuiz" className="flex items-center gap-2">
            <BookText className="h-4 w-4" />
            <span>{getTranslation(language, "createQuiz")}</span>
          </TabsTrigger>
          <TabsTrigger value="manageStudents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{getTranslation(language, "manageStudents")}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>{getTranslation(language, "analytics")}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="createQuiz">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation(language, "createQuiz")}</CardTitle>
              <CardDescription>
                {getTranslation(language, "createQuizDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quiz-title">{getTranslation(language, "quizTitle")}</Label>
                  <Input 
                    id="quiz-title" 
                    value={quizTitle} 
                    onChange={(e) => setQuizTitle(e.target.value)} 
                    placeholder={getTranslation(language, "quizTitlePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-subject">{getTranslation(language, "subject")}</Label>
                  <Select value={quizSubject} onValueChange={setQuizSubject}>
                    <SelectTrigger id="quiz-subject">
                      <SelectValue placeholder={getTranslation(language, "selectSubject")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quiz-class">{getTranslation(language, "classLevel")}</Label>
                  <Select value={quizClass} onValueChange={setQuizClass}>
                    <SelectTrigger id="quiz-class">
                      <SelectValue placeholder={getTranslation(language, "selectClass")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">Grade 6</SelectItem>
                      <SelectItem value="7">Grade 7</SelectItem>
                      <SelectItem value="8">Grade 8</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="prize" 
                  checked={hasPrize} 
                  onCheckedChange={setHasPrize} 
                />
                <Label htmlFor="prize">{getTranslation(language, "hasPrize")}</Label>
              </div>
              
              {hasPrize && (
                <div>
                  <Label htmlFor="prize-description">{getTranslation(language, "prizeDescription")}</Label>
                  <Textarea 
                    id="prize-description" 
                    value={prizeDescription} 
                    onChange={(e) => setPrizeDescription(e.target.value)} 
                    placeholder={getTranslation(language, "prizeDescriptionPlaceholder")}
                  />
                </div>
              )}
              
              <div className="space-y-6">
                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <Label htmlFor={`question-${questionIndex}`}>
                        {getTranslation(language, "question")} {questionIndex + 1}
                      </Label>
                      {questions.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    
                    <Textarea 
                      id={`question-${questionIndex}`} 
                      value={question.question} 
                      onChange={(e) => updateQuestion(questionIndex, e.target.value)} 
                      placeholder={getTranslation(language, "questionPlaceholder")}
                    />
                    
                    <div className="space-y-3">
                      <Label>{getTranslation(language, "options")}</Label>
                      <RadioGroup 
                        value={question.correctAnswer.toString()} 
                        onValueChange={(value) => updateCorrectAnswer(questionIndex, parseInt(value))}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionIndex.toString()} id={`q${questionIndex}-option-${optionIndex}`} />
                            <Input 
                              value={option} 
                              onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)} 
                              placeholder={`${getTranslation(language, "option")} ${optionIndex + 1}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={addQuestion}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {getTranslation(language, "addQuestion")}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={saveQuiz}>
                <Save className="h-4 w-4 mr-2" />
                {getTranslation(language, "saveQuiz")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="manageStudents">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation(language, "manageStudents")}</CardTitle>
              <CardDescription>
                {getTranslation(language, "manageStudentsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                {getTranslation(language, "comingSoon")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation(language, "analytics")}</CardTitle>
              <CardDescription>
                {getTranslation(language, "analyticsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                {getTranslation(language, "comingSoon")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherPanel;

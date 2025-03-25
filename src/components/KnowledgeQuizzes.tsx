
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  LucideIcon, 
  BookOpen, 
  School, 
  Brain, 
  Loader2,
  BarChart3,
  Globe,
} from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import { fetchPublicQuizzes } from '@/services/quizService';
import { getTranslation } from '@/utils/translations';

interface KnowledgeQuizzesProps {
  language: string;
}

const difficultyIcons: Record<string, LucideIcon> = {
  'Easy': BookOpen,
  'Medium': School,
  'Hard': Brain,
};

const KnowledgeQuizzes: React.FC<KnowledgeQuizzesProps> = ({ language }) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPublicQuizzes = async () => {
      try {
        setLoading(true);
        const publicQuizzes = await fetchPublicQuizzes();
        setQuizzes(publicQuizzes);
      } catch (error) {
        console.error('Error fetching public quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPublicQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-10">
        <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">
          {getTranslation(language, 'noPublicQuizzes')}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {getTranslation(language, 'checkBackLater')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {getTranslation(language, 'knowledgeQuizzes')}
          </h2>
          <p className="text-muted-foreground">
            {getTranslation(language, 'knowledgeQuizzesDescription')}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="mt-2 md:mt-0"
          onClick={() => navigate('/quiz')}
        >
          {getTranslation(language, 'Бүх тестийг харах')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => {
          const DifficultyIcon = difficultyIcons[quiz.difficulty] || BookOpen;
          
          return (
            <Card key={quiz.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2 px-2 py-0.5 flex items-center">
                    <DifficultyIcon className="h-3 w-3 mr-1" />
                    {quiz.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    {getTranslation(language, 'public')}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description || getTranslation(language, 'noDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center">
                    <School className="h-3 w-3 mr-1" />
                    {getTranslation(language, 'grade')} {quiz.grade}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {quiz.subject}
                  </Badge>
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {quiz.timeMinutes} {getTranslation(language, 'minutes')}
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {quiz.questionCount || 0} {getTranslation(language, 'questions')}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                >
                  {getTranslation(language, 'takeQuiz')}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeQuizzes;

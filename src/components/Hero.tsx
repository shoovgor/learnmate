import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTranslation } from '@/utils/translations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import { fetchQuizzes } from '@/services/quizService';
import { Quiz } from '@/models/quiz';

interface HeroProps {
  language: string;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedQuizzes = async () => {
      try {
        setLoading(true);
        const quizzes = await fetchQuizzes({
          limit: 3 
        });
        setFeaturedQuizzes(quizzes as Quiz[]);
      } catch (error) {
        console.error('Error loading featured quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedQuizzes();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 border-primary/20">
              {getTranslation(language, 'Шинэ платпорм')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {getTranslation(language, 'heroTitle')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {getTranslation(language, 'heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild className="group">
                <Link to="/quiz">
                  {getTranslation(language, 'Тестүүдийг харах')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/community">
                  {getTranslation(language, 'Олон нийтийн хэсэг')}
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-2xl bg-card border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-semibold">
                {getTranslation(language, 'Шинэ тестүүд')}
              </h2>
              <p className="text-muted-foreground mt-1">
                {getTranslation(language, 'Мэдлэг шалгах тестүүд')}
              </p>
            </div>
            
            <div className="divide-y divide-border">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : featuredQuizzes.length > 0 ? (
                featuredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium">
                      <Link to={`/quiz/${quiz.id}`} className="hover:underline">
                        {quiz.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                      {quiz.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="flex gap-1 items-center">
                        <BookOpen className="h-3 w-3" />
                        {quiz.subject}
                      </Badge>
                      <Badge variant="outline" className="flex gap-1 items-center">
                        <Users className="h-3 w-3" />
                        {quiz.popularity || 0}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {getTranslation(language, 'Одоогоор тест байхгүй байна')}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted/30 border-t border-border">
              <Button variant="ghost" asChild className="w-full">
                <Link to="/quiz" className="flex justify-center">
                  {getTranslation(language, 'Бүх тестийг харах')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

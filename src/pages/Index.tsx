import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import { Button } from '@/components/ui/button';
import { CardHeader, CardContent, CardFooter, CardTitle, CardDescription, Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Award, Users, Brain, BookText, ArrowRight } from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import HomeStats from '@/components/HomeStats';
import FeaturedTeachers from '@/components/FeaturedTeachers';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const navigate = useNavigate();

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('language') || 'mn');
    };

    window.addEventListener('languageChange', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const popularSubjects = [
    { id: 1, name: language === 'mn' ? 'Математик' : 'Mathematics', icon: <Brain className="h-5 w-5" />, count: 145 },
    { id: 2, name: language === 'mn' ? 'Физик' : 'Physics', icon: <BookOpen className="h-5 w-5" />, count: 102 },
    { id: 3, name: language === 'mn' ? 'Биологи' : 'Biology', icon: <BookOpen className="h-5 w-5" />, count: 98 },
    { id: 4, name: language === 'mn' ? 'Түүх' : 'History', icon: <BookOpen className="h-5 w-5" />, count: 87 },
    { id: 5, name: language === 'mn' ? 'Хими' : 'Chemistry', icon: <BookOpen className="h-5 w-5" />, count: 76 },
    { id: 6, name: language === 'mn' ? 'Англи хэл' : 'English', icon: <BookOpen className="h-5 w-5" />, count: 64 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: language === 'mn' ? 'Математикийн тэмцээн' : 'Mathematics Competition',
      date: '2023-06-15',
      time: '14:00',
      participants: 45
    },
    {
      id: 2,
      title: language === 'mn' ? 'Шинжлэх ухааны өдөр' : 'Science Day Event',
      date: '2023-06-22',
      time: '10:00',
      participants: 78
    },
    {
      id: 3,
      title: language === 'mn' ? 'Програмчлалын сорил' : 'Coding Challenge',
      date: '2023-06-29',
      time: '15:30',
      participants: 32
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <main className="flex-1">
        <Hero language={language} />
        
        <div className="container mx-auto px-4 py-12">
          <HomeStats language={language} />
          
          <Features />
          
          <div className="mt-16 mb-8">
            <h2 className="text-3xl font-bold text-center mb-4">
              {language === 'mn' ? 'Сурах үйл явцаа хянаарай' : 'Track Your Learning Progress'}
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              {language === 'mn' 
                ? 'EduSync-н тусламжтайгаар суралцах үйл явцаа хянаж, өөрийн мэдлэгийг сайжруулаарай'
                : 'Monitor your learning journey and improve your knowledge with EduSync'
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-md transition-all">
                <CardHeader>
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto flex items-center justify-center">
                    <BookText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">
                    {language === 'mn' ? 'Сурах төлөвлөгөө' : 'Study Plan'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'mn' ? 'Өдөр тутмын сурах төлөвлөгөө' : 'Daily learning schedule'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    {language === 'mn'
                      ? 'Суралцах хуваарь, зорилго тогтоож, хичээлүүдээ зохион байгуулж суралцах үйл явцаа хянаарай'
                      : 'Set learning goals, organize courses, and track your progress with a personalized study plan'
                    }
                  </p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline" onClick={() => navigate('/study-plan')}>
                    {language === 'mn' ? 'Төлөвлөгөө үүсгэх' : 'Create Plan'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-all">
                <CardHeader>
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">
                    {language === 'mn' ? 'Мэдлэгээ шалгах' : 'Test Knowledge'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'mn' ? 'Сар тутмын шалгалт' : 'Monthly assessments'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    {language === 'mn'
                      ? 'Янз бүрийн түвшний интерактив тест, даалгаваруудыг ашиглан мэдлэгээ шалгаарай'
                      : 'Evaluate your understanding with interactive quizzes and assignments for different skill levels'
                    }
                  </p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline" onClick={() => navigate('/quiz')}>
                    {language === 'mn' ? 'Тестүүд үзэх' : 'View Quizzes'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-all">
                <CardHeader>
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">
                    {language === 'mn' ? 'Бусадтай холбогдох' : 'Connect with Others'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'mn' ? 'Сурагчид & багш нар' : 'Students & teachers'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    {language === 'mn'
                      ? 'Ижил сонирхолтой сурагчид, туршлагатай багш нартай холбогдож хамтдаа суралцаарай'
                      : 'Connect with like-minded students and experienced teachers to learn together'
                    }
                  </p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline" onClick={() => navigate('/community')}>
                    {language === 'mn' ? 'Хамт олонд нэгдэх' : 'Join Community'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <FeaturedTeachers language={language} />
          
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'mn' ? 'Ирэх арга хэмжээнүүд' : 'Upcoming Events'}
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <Card key={event.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-muted-foreground text-sm">{event.date} | {event.time}</p>
                          <div className="flex items-center mt-2 text-sm">
                            <Users className="h-4 w-4 mr-1 text-primary" />
                            <span>{event.participants} {language === 'mn' ? 'оролцогчид' : 'participants'}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {language === 'mn' ? 'Түгээмэл сэдвүүд' : 'Popular Subjects'}
              </h2>
              <div className="space-y-3">
                {popularSubjects.map(subject => (
                  <Button
                    key={subject.id}
                    variant="outline"
                    className="w-full justify-between font-normal h-auto py-3"
                    onClick={() => navigate('/quiz')}
                  >
                    <div className="flex items-center">
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        {subject.icon}
                      </div>
                      <span>{subject.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {subject.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

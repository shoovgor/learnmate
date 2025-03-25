import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { School, GraduationCap, Trophy, Award, UserCog, Settings, BookOpen, Star, Clock, CheckCircle } from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { toast } from 'sonner';
import { auth, db } from '@/config/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

const Profile = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  interface UserStats {
    points: number;
    completedQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    correctRate: number;
    rank?: number;
  }

  const defaultStats: UserStats = {
    points: 0,
    completedQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    correctRate: 0,
    rank: 0
  };

  const [userStats, setUserStats] = useState<UserStats>(defaultStats);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          
          if (auth.currentUser) {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const freshUserData = userDoc.data();
              localStorage.setItem('userData', JSON.stringify({
                uid: auth.currentUser.uid,
                ...freshUserData
              }));
              setUserData({
                uid: auth.currentUser.uid,
                ...freshUserData
              });
            }
          }
        }
        
        await fetchUserStats();
        
        await fetchRecentQuizzes();
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error(getTranslation(language, 'errorFetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [language, navigate]);

  const fetchUserStats = async () => {
    try {
      if (auth.currentUser) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        setUserStats({
          points: userData.points || 0,
          completedQuizzes: userData.completedQuizzes || 0,
          totalAttempts: 10,
          averageScore: 85,
          correctRate: 0.75,
          rank: 42
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchRecentQuizzes = async () => {
    try {
      if (auth.currentUser) {
        setRecentQuizzes([
          {
            id: '1',
            title: 'Mathematics Quiz',
            score: 85,
            totalQuestions: 10,
            correctAnswers: 8,
            completedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Science Quiz',
            score: 90,
            totalQuestions: 10,
            correctAnswers: 9,
            completedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'History Quiz',
            score: 70,
            totalQuestions: 10,
            correctAnswers: 7,
            completedAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching recent quizzes:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNavigation />
        <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-8 mt-16">
          <div className="flex justify-center items-center h-full">
            <p>{getTranslation(language, 'loading')}...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Card className="md:w-1/3 h-fit">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <ProfilePictureUpload userId={userData?.uid} />
                </div>
                <CardTitle className="mt-2">{userData?.displayName || 'User'}</CardTitle>
                <CardDescription>{userData?.email || 'user@example.com'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center">
                  <School className="h-5 w-5 mr-3 text-primary" />
                  <span>{userData?.school || getTranslation(language, 'notSpecified')}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-3 text-primary" />
                  <span>{getTranslation(language, 'grade')}: {userData?.grade || getTranslation(language, 'notSpecified')}</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-3 text-primary" />
                  <span>{getTranslation(language, 'points')}: {userStats?.points || 0}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-3 text-primary" />
                  <span>{getTranslation(language, 'rank')}: {userStats?.rank || 'N/A'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-center gap-2 pt-0">
                <Button variant="outline" size="sm">
                  <UserCog className="mr-2 h-4 w-4" />
                  {getTranslation(language, 'editProfile')}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  {getTranslation(language, 'settings')}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="md:w-2/3">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">{getTranslation(language, 'overview')}</TabsTrigger>
                  <TabsTrigger value="stats">{getTranslation(language, 'statistics')}</TabsTrigger>
                  <TabsTrigger value="achievements">{getTranslation(language, 'achievements')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getTranslation(language, 'recentActivity')}</CardTitle>
                      <CardDescription>{getTranslation(language, 'yourRecentQuizzes')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentQuizzes.length > 0 ? (
                        <div className="space-y-4">
                          {recentQuizzes.map((quiz) => (
                            <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-medium">{quiz.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(quiz.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{quiz.score}%</p>
                                <p className="text-sm text-muted-foreground">
                                  {quiz.correctAnswers}/{quiz.totalQuestions} {getTranslation(language, 'correct')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p>{getTranslation(language, 'noRecentQuizzes')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="stats" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getTranslation(language, 'yourStatistics')}</CardTitle>
                      <CardDescription>{getTranslation(language, 'performanceOverview')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{getTranslation(language, 'completedQuizzes')}</span>
                            <span className="text-sm font-medium">{userStats.completedQuizzes}</span>
                          </div>
                          <Progress value={Math.min(userStats.completedQuizzes * 10, 100)} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{getTranslation(language, 'averageScore')}</span>
                            <span className="text-sm font-medium">{userStats.averageScore}%</span>
                          </div>
                          <Progress value={userStats.averageScore} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{getTranslation(language, 'correctAnswerRate')}</span>
                            <span className="text-sm font-medium">{Math.round(userStats.correctRate * 100)}%</span>
                          </div>
                          <Progress value={userStats.correctRate * 100} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="flex flex-col items-center p-4 border rounded-lg">
                            <Star className="h-8 w-8 text-primary mb-2" />
                            <span className="text-2xl font-bold">{userStats.points}</span>
                            <span className="text-sm text-muted-foreground">{getTranslation(language, 'totalPoints')}</span>
                          </div>
                          
                          <div className="flex flex-col items-center p-4 border rounded-lg">
                            <Clock className="h-8 w-8 text-primary mb-2" />
                            <span className="text-2xl font-bold">{userStats.totalAttempts}</span>
                            <span className="text-sm text-muted-foreground">{getTranslation(language, 'totalAttempts')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="achievements" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getTranslation(language, 'achievements')}</CardTitle>
                      <CardDescription>{getTranslation(language, 'yourAchievements')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <p>{getTranslation(language, 'noAchievementsYet')}</p>
                        <p className="text-sm text-muted-foreground mt-1">{getTranslation(language, 'completeMoreQuizzes')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;

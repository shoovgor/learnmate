import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  BookOpen, 
  Users, 
  MessageCircle, 
  UserMinus, 
  BarChart3, 
  Calendar,
  ChevronLeft,
  Star,
  GraduationCap,
  Book,
  Award,
  Heart
} from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';
import { getTranslation } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";

const FriendProfile = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const language = localStorage.getItem('language') || 'mn';

  // Mock data for a friend's profile
  const [friend, setFriend] = useState({
    id: 1,
    name: "Баттулга",
    avatar: "",
    status: "online",
    school: "Шинэ Эрин Олон Улсын Сургууль",
    grade: "11A",
    position: "Математикийн багш",
    isTeacher: false,
    subjects: ["Математик", "Физик"],
    stats: {
      quizzesTaken: 24,
      averageScore: 88,
      questionsAnswered: 125,
      peopleSaved: 42,
      coursesCreated: 8,
      studentsHelped: 65,
      averageRating: 4.7,
      quizzesCreated: 12,
    },
    recentActivity: [
      { id: 1, title: "Алгебрийн тест", type: "quiz", date: "2023-11-15", score: 92 },
      { id: 2, title: "Физикийн асуултад хариулсан", type: "answer", date: "2023-11-14" },
      { id: 3, title: "'Геометрийн үндэс' курс", type: "course", date: "2023-11-10" },
    ],
    achievements: [
      { id: 1, title: "Тэргүүний сурагч", description: "Математикийн олимпиадад түрүүлсэн", date: "2023-10-20", icon: "🥇" },
      { id: 2, title: "Идэвхтэй оролцогч", description: "Хамгийн олон асуултад хариулсан", date: "2023-11-01", icon: "💬" },
    ],
  });

  const isTeacher = friend.isTeacher;

  useEffect(() => {
    // Fetch friend data based on friendId (mock data for now)
    // Replace with actual API call later
  }, [friendId]);

  const handleMessage = () => {
    toast({
      title: getTranslation(language, "comingSoon"),
      description: getTranslation(language, "messagingFeatureComingSoon"),
    });
  };

  const handleUnfriend = () => {
    toast({
      title: language === 'mn' ? 'Найзаас цуцлах' : 'Unfriend',
      description: language === 'mn' ? 'Та энэ хэрэглэгчийг найзаасаа хаслаа' : 'You have unfriended this user',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/profile/friends">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {getTranslation(language, "backToFriends")}
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/3">
              <Card className="animate-fade-in shadow-md">
                <CardHeader className="pb-2 relative">
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={friend.status === 'online' ? "default" : "secondary"}
                      className="rounded-full px-2 py-0 text-xs"
                    >
                      {friend.status === 'online' 
                        ? getTranslation(language, "online") 
                        : getTranslation(language, "offline")}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-3">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback className="text-xl">
                        {friend.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-center">{friend.name}</CardTitle>
                    <CardDescription className="text-center mt-1">
                      {isTeacher ? friend.position : `${getTranslation(language, "grade")} ${friend.grade}`}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, "school")}</p>
                      <p className="font-medium">{friend.school}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, "favoriteSubjects")}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {friend.subjects.map((subject, i) => (
                          <Badge key={i} variant="outline">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      {isTeacher ? (
                        <>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.coursesCreated}</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "coursesCreated")}</p>
                          </div>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.studentsHelped}</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "studentsHelped")}</p>
                          </div>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.averageRating}/5</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "averageRating")}</p>
                          </div>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.quizzesCreated}</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "quizzesCreated")}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.quizzesTaken}</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "quizzesTaken")}</p>
                          </div>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.averageScore}%</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "averageScore")}</p>
                          </div>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.questionsAnswered}</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "questionsAnswered")}</p>
                          </div>
                          <div className="text-center p-2 border rounded-md">
                            <p className="text-lg font-bold">{friend.stats.peopleSaved}</p>
                            <p className="text-xs text-muted-foreground">{getTranslation(language, "peopleHelped")}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleMessage}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {getTranslation(language, "sendMessage")}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive/10" 
                    onClick={handleUnfriend}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    {getTranslation(language, "unfriend")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="activity" className="w-full animate-fade-in">
                <TabsList className="mb-4">
                  <TabsTrigger value="activity">{getTranslation(language, "recentActivity")}</TabsTrigger>
                  <TabsTrigger value="achievements">{getTranslation(language, "achievements")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        {getTranslation(language, "recentActivity")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {friend.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start border-b last:border-0 pb-3 last:pb-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 
                            ${activity.type === 'quiz' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                              activity.type === 'answer' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                              activity.type === 'course' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 
                              'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                              {activity.type === 'quiz' ? <Book className="h-5 w-5" /> :
                               activity.type === 'answer' ? <MessageCircle className="h-5 w-5" /> :
                               activity.type === 'course' ? <BookOpen className="h-5 w-5" /> :
                               <Award className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {new Date(activity.date).toLocaleDateString(language === 'mn' ? 'mn-MN' : 'en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                {activity.score && (
                                  <Badge variant="outline" className="ml-auto">
                                    {activity.score}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {!isTeacher && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Calendar className="mr-2 h-5 w-5" />
                          {getTranslation(language, "upcomingStudySessions")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4 text-muted-foreground">
                          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{getTranslation(language, "noUpcomingSessions")}</p>
                          <Button variant="outline" className="mt-3">
                            {getTranslation(language, "inviteToStudy")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {isTeacher && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BookOpen className="mr-2 h-5 w-5" />
                          {getTranslation(language, "recommendedCourses")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start border-b last:border-0 pb-3 last:pb-0">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-primary/10">
                                <Book className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{isTeacher ? "Гүнзгий математик" : "Алгебрын үндэс"} {i}</p>
                                <p className="text-sm text-muted-foreground mt-1">{getTranslation(language, "createdBy")} {friend.name}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                {getTranslation(language, "view")}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="achievements" className="space-y-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Trophy className="mr-2 h-5 w-5" />
                        {getTranslation(language, "achievements")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {friend.achievements.map((achievement) => (
                          <div key={achievement.id} className="border rounded-lg p-3 hover:shadow-sm transition-all">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-lg">{achievement.icon}</span>
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium">{achievement.title}</h4>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                <div className="flex items-center mt-2">
                                  <Star className="h-3 w-3 text-amber-500 mr-1" />
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(achievement.date).toLocaleDateString(language === 'mn' ? 'mn-MN' : 'en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-red-500" />
                        {getTranslation(language, "thanksReceived")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start border-b last:border-0 pb-3 last:pb-0">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback className="bg-primary/10">
                                {String.fromCharCode(64 + i)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm italic">"{isTeacher ? 
                                `${getTranslation(language, "thanksTeacherMessage")}` : 
                                `${getTranslation(language, "thanksStudentMessage")}` }"</p>
                              <p className="text-xs text-muted-foreground mt-1">- {isTeacher ? "Сурагч" : "Найз"} {i}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FriendProfile;

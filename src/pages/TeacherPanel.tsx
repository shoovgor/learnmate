import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTranslation } from '@/utils/translations';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import CreateQuiz from '@/components/teacher/CreateQuiz';
import StudentManagement from '@/components/teacher/StudentManagement';
import { getTeacherStudents } from '@/services/teacherService';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  BarChart2, 
  PieChart as PieChartIcon
} from 'lucide-react';

const TeacherPanel = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuizzes: 0,
    totalCompletions: 0,
    averageScore: 0,
    subjectPerformance: [],
    quizCompletionRates: [],
    studentProgress: [],
    gradeDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'mn';
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.uid || (userData.role !== 'teacher' && userData.role !== 'admin')) {
          navigate('/auth');
          return;
        }
        
        const teacherStats = await getTeacherStudents(userData.uid);
        setStats({
          totalStudents: teacherStats.students.length,
          totalQuizzes: teacherStats.classes.length,
          totalCompletions: 0, // You need to calculate this based on your data
          averageScore: 0, // You need to calculate this based on your data
          subjectPerformance: [], // You need to transform this based on your data
          quizCompletionRates: [], // You need to transform this based on your data
          studentProgress: teacherStats.students.map(student => ({
            name: student.name,
            photoURL: student.photoURL,
            completedQuizzes: 0, // You need to calculate this based on your data
            averageScore: 0, // You need to calculate this based on your data
            progress: 0 // You need to calculate this based on your data
          })),
          gradeDistribution: [] // You need to transform this based on your data
        });
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [navigate]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">Багшийн самбар</h1>
        
        <Tabs defaultValue="quizzes" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="quizzes">Шалгалтууд</TabsTrigger>
            <TabsTrigger value="students">Сурагчид</TabsTrigger>
            <TabsTrigger value="stats">Статистик</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quizzes">
            <CreateQuiz language={language} />
          </TabsContent>
          
          <TabsContent value="students">
            <StudentManagement language={language} />
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Нийт оюутнууд
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Нийт шалгалтууд
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Дуусгасан шалгалтууд
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{stats.totalCompletions}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Дундаж оноо
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Хичээлийн гүйцэтгэл</CardTitle>
                  <CardDescription>
                    Хичээл тус бүрийн дундаж оноо
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.subjectPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Шалгалтын гүйцэтгэлийн хувь</CardTitle>
                  <CardDescription>
                    Шалгалт тус бүрийн гүйцэтгэлийн хувь
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={stats.quizCompletionRates}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Дүнгийн тархалт</CardTitle>
                  <CardDescription>
                    Онооны тархалт
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Оюутнуудын ахиц</CardTitle>
                  <CardDescription>
                    Шалгалт дуусгасан шилдэг оюутнууд
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {stats.studentProgress.map((student, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={student.photoURL} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {student.completedQuizzes} шалгалт дуусгасан
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">{student.averageScore}%</Badge>
                          </div>
                          <Progress value={student.progress} className="h-2" />
                          <Separator className="mt-2" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherPanel;

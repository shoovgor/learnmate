import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  LineChart, 
  MoreVertical, 
  PencilLine, 
  Plus, 
  Star, 
  Trash2, 
  TrendingUp,
  Book
} from 'lucide-react';
import { format } from "date-fns";
import { mn } from "date-fns/locale"; // Add Mongolian locale
import { useToast } from "@/components/ui/use-toast";

const StudyPlan = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Mock data for study sessions
  const todaySessions = [
    { id: 1, subject: 'Математик', topic: 'Алгебр: Квадрат тэгшитгэл', timeStart: '16:00', timeEnd: '17:30', completed: true },
    { id: 2, subject: 'Физик', topic: 'Цахилгаан соронзон', timeStart: '18:00', timeEnd: '19:30', completed: false },
  ];
  
  const upcomingSessions = [
    { id: 3, subject: 'Биологи', topic: 'Эсийн хуваагдал', timeStart: '15:00', timeEnd: '16:30', date: 'Маргааш' },
    { id: 4, subject: 'Хими', topic: 'Органик хими', timeStart: '17:00', timeEnd: '18:30', date: 'Маргааш' },
    { id: 5, subject: 'Англи хэл', topic: 'Эссе бичих', timeStart: '16:00', timeEnd: '17:30', date: '5 сарын 25' },
    { id: 6, subject: 'Түүх', topic: 'Дэлхийн хоёрдугаар дайн', timeStart: '18:00', timeEnd: '19:30', date: '5 сарын 25' },
  ];
  
  // Mock data for progress
  const subjectProgress = [
    { subject: 'Математик', completed: 28, total: 45, percentage: 62 },
    { subject: 'Физик', completed: 15, total: 30, percentage: 50 },
    { subject: 'Биологи', completed: 12, total: 25, percentage: 48 },
    { subject: 'Хими', completed: 18, total: 30, percentage: 60 },
    { subject: 'Англи', completed: 22, total: 40, percentage: 55 },
  ];
  
  // Sort subjects by progress percentage
  const sortedSubjects = [...subjectProgress].sort((a, b) => b.percentage - a.percentage);
  
  const addNewTask = () => {
    setIsTaskDialogOpen(false);
    
    toast({
      title: "Study session added",
      description: "Your new study session has been scheduled.",
    });
  };
  
  const completeSession = (id: number) => {
    toast({
      title: "Session marked as completed",
      description: "Great job! Keep up the good work.",
    });
  };
  
  return (
    <div className="min-h-screen pt-16 bg-background">
      <MainNavigation />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Суралцах төлөвлөгөө</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Төлөвлөсөн хичээлийн хуваарь</CardTitle>
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Хичээлийн хуваарь нэмэх
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Шинэ хичээлийн хуваарь нэмэх</DialogTitle>
                        <DialogDescription>
                          Суралцах цагаа үр дүнтэй төлөвлөж, хуваарилаарай.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4 px-4 max-h-[32rem] overflow-y-auto">
                        <div className="space-y-2">
                          <Label htmlFor="subject">Хичээл</Label>
                          <Input id="subject" placeholder="жишээ нь: Математик" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="topic">Сэдэв</Label>
                          <Input id="topic" placeholder="жишээ нь: Алгебр: Квадрат тэгшитгэл" />
                        </div>
                        <div className="space-y-2">
                          <Label>Огноо</Label>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="border rounded-md p-3"
                            locale={mn} // Set Mongolian locale for the calendar
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="start-time">Эхлэх цаг</Label>
                            <Input id="start-time" type="time" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end-time">Дуусах цаг</Label>
                            <Input id="end-time" type="time" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="reminder" />
                          <label
                            htmlFor="reminder"
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            Сануулга тохируулах
                          </label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                          Болих
                        </Button>
                        <Button onClick={addNewTask}>
                          Хуваарьт оруулах
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today">
                  <TabsList className="mb-4">
                    <TabsTrigger value="today">Өнөөдөр</TabsTrigger>
                    <TabsTrigger value="upcoming">Ирэх</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="today" className="space-y-4">
                    {todaySessions.map((session) => (
                      <div key={session.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className={`p-2 rounded-full ${session.completed ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                          {session.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{session.subject}</div>
                          <div className="text-sm text-muted-foreground">{session.topic}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {session.timeStart} - {session.timeEnd}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!session.completed && (
                            <Button variant="outline" size="sm" onClick={() => completeSession(session.id)}>
                              Дууссан
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <PencilLine className="h-4 w-4 mr-2" />
                                Завсарлах
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Устгах
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {todaySessions.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Өнөөдөрт хуваарьласан хичээл байхгүй</h3>
                        <p className="text-muted-foreground mb-4">Шинэ хичээлийн хуваарь нэмэх замаар суралцах цагаа төлөвлөөрэй.</p>
                        <Button onClick={() => setIsTaskDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Хичээлийн хуваарь нэмэх
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{session.subject}</div>
                          <div className="text-sm text-muted-foreground">{session.topic}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {session.date}, {session.timeStart} - {session.timeEnd}
                          </div>
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <PencilLine className="h-4 w-4 mr-2" />
                                Завсарлах
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Устгах
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {upcomingSessions.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Ирэх хичээлийн хуваарь байхгүй</h3>
                        <p className="text-muted-foreground mb-4">Ирээдүйн хичээлийн хуваарийг төлөвлөөрэй.</p>
                        <Button onClick={() => setIsTaskDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Хичээлийн хуваарь нэмэх
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Суралцах зөвлөмжүүд</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Дасгал давтах нь төгс болгодог</h3>
                      <p className="text-sm text-muted-foreground">
                        Тогтмол давтлага хийх нь шалгалтын өмнөх шахуу давтлагаас илүү үр дүнтэй. 
                        Нэг сэдвийг олон удаа, завсарлагатайгаар судлахыг хичээгээрэй.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Тогтмол завсарлага авах</h3>
                      <p className="text-sm text-muted-foreground">
                        Помодоро арга нь 25 минут суралцаж, дараа нь 5 минут завсарлахыг санал болгодог. 
                        Энэ нь анхаарлаа төвлөрүүлж, ядаргаанаас сэргийлдэг.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Хэцүү хичээлүүдийг тэргүүнд тавих</h3>
                      <p className="text-sm text-muted-foreground">
                        Оюун санаа сэргэг байх үед хамгийн хэцүү хичээлүүдээс эхэл. 
                        Илүү хялбар сэдвүүдийг хожим судлаарай.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Өнөөдрийн төлөвлөгөө</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">
                    {format(new Date(), "EEEE", { locale: mn }).charAt(0).toUpperCase() + format(new Date(), "EEEE", { locale: mn }).slice(1)}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {format(new Date(), "MMMM d, yyyy", { locale: mn }).charAt(0).toUpperCase() + format(new Date(), "MMMM d, yyyy", { locale: mn }).slice(1)}
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Хичээлийн хуваарь:</span>
                    <span>{todaySessions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Нийт суралцах хугацаа:</span>
                    <span>3 hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Дуусгасан:</span>
                    <span>{todaySessions.filter(s => s.completed).length} of {todaySessions.length}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <Button variant="outline" className="w-full" onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Хичээлийн хуваарь нэмэх
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Хичээлийн ахиц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedSubjects.map((subject) => (
                    <div key={subject.subject} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Book className="h-4 w-4 mr-2 text-primary" />
                          <span>{subject.subject}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {subject.completed}/{subject.total} сэдэв
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary"
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{subject.percentage}% дууссан</span>
                        {subject.percentage >= 60 ? (
                          <span className="flex items-center text-green-500">
                            <TrendingUp className="h-3 w-3 mr-1" /> Зөв замдаа
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-500">
                            <TrendingUp className="h-3 w-3 mr-1" /> Анхаарах шаардлагатай
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyPlan;

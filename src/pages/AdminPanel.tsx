
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { getTranslation } from '@/utils/translations';
import { useToast } from '@/hooks/use-toast';
import { 
  getTeachers, 
  promoteToTeacher, 
  demoteTeacher 
} from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  UserPlus, 
  UserMinus, 
  Shield, 
  User,
  Users,
  Loader2,
  AlertTriangle
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [activeTab, setActiveTab] = useState('teachers');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const language = localStorage.getItem('language') || 'mn';

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role !== 'admin') {
      toast({
        title: getTranslation(language, 'accessDenied'),
        description: getTranslation(language, 'adminAccessRequired'),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    
    setIsAdmin(true);
    
    // Load teachers
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const teachersData = await getTeachers();
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error loading teachers:', error);
        toast({
          title: getTranslation(language, 'error'),
          description: getTranslation(language, 'failedToLoadTeachers'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTeachers();
  }, [navigate, toast, language]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePromoteTeacher = async () => {
    if (!newTeacherEmail) {
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'emailRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // In a real implementation, you would search for the user by email and then promote them
      await promoteToTeacher(newTeacherEmail);
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'teacherPromoted'),
      });
      
      // Refresh teachers list
      const teachersData = await getTeachers();
      setTeachers(teachersData);
      
      // Reset form
      setNewTeacherEmail('');
      setShowPromoteDialog(false);
    } catch (error) {
      console.error('Error promoting teacher:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'failedToPromoteTeacher'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoteTeacher = async (teacherId: string) => {
    try {
      setLoading(true);
      await demoteTeacher(teacherId);
      
      toast({
        title: getTranslation(language, 'success'),
        description: getTranslation(language, 'teacherDemoted'),
      });
      
      // Refresh teachers list
      const teachersData = await getTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error demoting teacher:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'failedToDemoteTeacher'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <Shield className="inline-block mr-2 text-primary" />
              {getTranslation(language, 'adminPanel')}
            </h1>
            <p className="text-muted-foreground">
              {getTranslation(language, 'manageSystemUsers')}
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{getTranslation(language, 'teachers')}</span>
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{getTranslation(language, 'admins')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                <CardTitle>{getTranslation(language, 'teacherManagement')}</CardTitle>
                
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={getTranslation(language, 'searchTeachers')}
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  
                  <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-1">
                        <UserPlus className="h-4 w-4" />
                        <span>{getTranslation(language, 'addTeacher')}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{getTranslation(language, 'addNewTeacher')}</DialogTitle>
                        <DialogDescription>
                          {getTranslation(language, 'enterTeacherEmailToPromote')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          type="email"
                          placeholder="teacher@example.com"
                          value={newTeacherEmail}
                          onChange={(e) => setNewTeacherEmail(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowPromoteDialog(false)}
                        >
                          {getTranslation(language, 'cancel')}
                        </Button>
                        <Button onClick={handlePromoteTeacher} disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {getTranslation(language, 'promoting')}
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              {getTranslation(language, 'promote')}
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredTeachers.length > 0 ? (
                  <Table>
                    <TableCaption>
                      {getTranslation(language, 'totalTeachers')}: {filteredTeachers.length}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{getTranslation(language, 'teacher')}</TableHead>
                        <TableHead>{getTranslation(language, 'email')}</TableHead>
                        <TableHead>{getTranslation(language, 'school')}</TableHead>
                        <TableHead className="text-right">{getTranslation(language, 'actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src={teacher.photoURL} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span>{teacher.displayName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>{teacher.school || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDemoteTeacher(teacher.id)}
                              title={getTranslation(language, 'demoteToStudent')}
                            >
                              <UserMinus className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">
                      {getTranslation(language, 'noTeachersFound')}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      {searchQuery 
                        ? getTranslation(language, 'noTeachersMatchSearch') 
                        : getTranslation(language, 'noTeachersYet')}
                    </p>
                    <Button onClick={() => setShowPromoteDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {getTranslation(language, 'addFirstTeacher')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation(language, 'adminManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center p-4 bg-amber-50 text-amber-800 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <p className="font-medium">
                      {getTranslation(language, 'adminManagementRestricted')}
                    </p>
                    <p className="text-sm mt-1">
                      {getTranslation(language, 'adminManagementDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;

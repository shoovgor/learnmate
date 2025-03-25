import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTranslation } from '@/utils/translations';
import { Class } from '@/models/class';
import { User } from '@/models/user';
import { 
  createClass, 
  getClasses, 
  getStudents, 
  getStudentsInClass,
  addStudentsToClass,
  removeStudentFromClass
} from '@/services/classService';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore'; // Import Firestore deleteDoc
import { db } from '@/config/firebaseConfig'; // Import Firestore configuration

interface StudentManagementProps {
  language: string;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ language }) => {
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [studentsInClass, setStudentsInClass] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);
  const [isDeletingClass, setIsDeletingClass] = useState(false); // Add state for deleting class
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [language]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const classesData = await getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Анги татаж чадсангүй'),
        variant: 'destructive',
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const studentsData = await getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Сурагчдыг татаж чадсангүй'),
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassStudents = async (classId: string) => {
    setLoadingClassStudents(true);
    try {
      const studentsData = await getStudentsInClass(classId);
      setStudentsInClass(studentsData);
    } catch (error) {
      console.error('Error fetching students in class:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorFetchingStudentsInClass'),
        variant: 'destructive',
      });
    } finally {
      setLoadingClassStudents(false);
    }
  };

  const handleClassSelect = (classId: string) => {
    const selected = classes.find(c => c.id === classId);
    if (selected) {
      setSelectedClass(selected);
      fetchClassStudents(selected.id);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleCreateClass = async () => {
    if (!className.trim()) return;

    setIsCreating(true);
    try {
      await createClass(className);
      toast({
        title: getTranslation(language, 'Анги үүсгэгдлээ'),
        description: getTranslation(language, 'Анги амжилттай үүсгэгдлээ'),
      });
      setClassName('');
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Анги үүсгэж чадсангүй'),
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const addStudentsToSelectedClass = async (selectedStudentIds: string[]) => {
    if (!selectedClass || selectedStudentIds.length === 0) return;
    
    setIsAdding(true);
    try {
      await addStudentsToClass(selectedClass.id, selectedStudentIds);
      
      toast({
        title: getTranslation(language, 'Сурагч нэмэгдлээ'),
        description: getTranslation(language, 'Сурагчдыг амжилттай нэмлээ'),
      });
      
      // Refresh class data
      fetchClassStudents(selectedClass.id);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error adding students:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Сурагчдыг нэмэж чадсангүй'),
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeStudentFromClassHandler = async (studentId: string) => {
    if (!selectedClass) return;

    setIsRemoving(true);
    try {
      await removeStudentFromClass(selectedClass.id, studentId);
      toast({
        title: getTranslation(language, 'Сурагч хасагдлаа'),
        description: getTranslation(language, 'Сурагчийг амжилттай хаслаа'),
      });
      fetchClassStudents(selectedClass.id);
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Сурагчийг хасаж чадсангүй'),
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    setIsDeletingClass(true);
    try {
      const classRef = doc(db, 'classes', selectedClass.id);
      await deleteDoc(classRef); // Delete the class document from Firestore
      toast({
        title: getTranslation(language, 'Анги устгагдлаа'),
        description: getTranslation(language, 'Анги амжилттай устгагдлаа'),
      });
      setSelectedClass(null);
      fetchClasses(); // Refresh the class list
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: getTranslation(language, 'Алдаа'),
        description: getTranslation(language, 'Анги устгаж чадсангүй'),
        variant: 'destructive',
      });
    } finally {
      setIsDeletingClass(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Create Class */}
      <Card>
        <CardHeader>
          <CardTitle>{getTranslation(language, 'Анги үүсгэх хэсэг')}</CardTitle>
          <CardDescription>{getTranslation(language, 'Шинэ анги үүсгэх')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">{getTranslation(language, 'Ангийн нэр')}</Label>
            <Input 
              id="className" 
              placeholder={getTranslation(language, 'Ангийн нэрийг оруулна уу')} 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <Button disabled={isCreating} onClick={handleCreateClass}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {getTranslation(language, 'Үүсгэж байна')}...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {getTranslation(language, 'Анги үүсгэх')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manage Students in Class */}
      <Card>
        <CardHeader>
          <CardTitle>{getTranslation(language, 'Сурагчдын мэдээлэл')}</CardTitle>
          <CardDescription>{getTranslation(language, 'Сурагчдын мэдээлэл')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classSelect">{getTranslation(language, 'Анги сонгох')}</Label>
            <Select onValueChange={handleClassSelect}>
              <SelectTrigger id="classSelect">
                <SelectValue placeholder={getTranslation(language, 'Анги сонгох')} />
              </SelectTrigger>
              <SelectContent>
                {loadingClasses ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getTranslation(language, 'Ачааллаж байна')}...
                  </SelectItem>
                ) : classes.length > 0 ? (
                  classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="Анги алга" disabled>
                    {getTranslation(language, 'Анги алга байна')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <>
              <div className="space-y-2">
                <Label>{getTranslation(language, 'Анги удирдах')}</Label>
                <div className="flex items-center justify-between">
                  <span>{selectedClass.name}</span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={isDeletingClass}
                    onClick={handleDeleteClass}
                  >
                    {isDeletingClass ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {getTranslation(language, 'Устгаж байна')}...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {getTranslation(language, 'Устгах')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{getTranslation(language, 'Сурагч нэмэх')}</Label>
                <Card className="border-none shadow-none">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[200px] w-full rounded-md border">
                      <div className="p-4">
                        {loadingStudents ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {getTranslation(language, 'Ачааллаж байна')}...
                          </div>
                        ) : students.length > 0 ? (
                          students.map(student => (
                            <div key={student.uid} className="flex items-center space-x-2">
                              <Checkbox
                                id={`student-${student.uid}`}
                                checked={selectedStudents.includes(student.uid)}
                                onCheckedChange={() => handleStudentSelect(student.uid)}
                              />
                              <Label htmlFor={`student-${student.uid}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {student.displayName}
                              </Label>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">
                            {getTranslation(language, 'Сурагч алга байна')}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Button disabled={isAdding || selectedStudents.length === 0} onClick={() => addStudentsToSelectedClass(selectedStudents)}>
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {getTranslation(language, 'Нэмж байна')}...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {getTranslation(language, 'Сурагч нэмэх')}
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>{getTranslation(language, 'Сурагч хасах')}</Label>
                <Card className="border-none shadow-none">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[200px] w-full rounded-md border">
                      <div className="p-4">
                        {loadingClassStudents ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {getTranslation(language, 'Ачааллаж байна')}...
                          </div>
                        ) : studentsInClass.length > 0 ? (
                          studentsInClass.map(student => (
                            <div key={student.uid} className="flex items-center justify-between py-2">
                              <span>{student.displayName}</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={isRemoving}
                                onClick={() => removeStudentFromClassHandler(student.uid)}
                              >
                                {isRemoving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {getTranslation(language, 'Хасаж байна')}...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {getTranslation(language, 'Хасах')}
                                  </>
                                )}
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">
                            {getTranslation(language, 'Сурагч алга байна')}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { getTranslation } from '@/utils/translations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  Loader2,
  PartyPopper,
} from 'lucide-react';
import { fetchTopUsers } from '@/services/quizService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Rankings = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<string>('');

  useEffect(() => {
    const loadTopUsers = async () => {
      try {
        setLoading(true);
        const users = await fetchTopUsers({ grade: gradeFilter });
        setTopUsers(users);
      } catch (error) {
        console.error('Error fetching top users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopUsers();
  }, [gradeFilter]);

  const grades = [
    { value: "6", label: language === 'mn' ? '6-р анги' : 'Grade 6' },
    { value: "7", label: language === 'mn' ? '7-р анги' : 'Grade 7' },
    { value: "8", label: language === 'mn' ? '8-р анги' : 'Grade 8' },
    { value: "9", label: language === 'mn' ? '9-р анги' : 'Grade 9' },
    { value: "10", label: language === 'mn' ? '10-р анги' : 'Grade 10' },
    { value: "11", label: language === 'mn' ? '11-р анги' : 'Grade 11' },
    { value: "12", label: language === 'mn' ? '12-р анги' : 'Grade 12' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{getTranslation(language, "rankings")}</h1>
            <p className="text-muted-foreground">
              {getTranslation(language, "Шилдэг сурагчдын жагсаалт")}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={getTranslation(language, "Бүх анги")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{getTranslation(language, "Бүх анги")}</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getTranslation(language, "Шилдэг сурагчид")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : topUsers.length > 0 ? (
              <Table>
                <TableCaption>
                  {getTranslation(language, "Шилдэг сурагчдын жагсаалт")}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">{getTranslation(language, "rank")}</TableHead>
                    <TableHead>{getTranslation(language, "name")}</TableHead>
                    <TableHead>{getTranslation(language, "points")}</TableHead>
                    <TableHead>{getTranslation(language, "grade")}</TableHead>
                    <TableHead>{getTranslation(language, "school")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {index === 0 && <PartyPopper className="h-4 w-4 mr-1 text-yellow-500" />}
                          {user.rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={user.photoURL} alt={user.displayName} />
                            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{user.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.points}</TableCell>
                      <TableCell>{user.grade || '-'}</TableCell>
                      <TableCell>{user.school || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Award className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  {getTranslation(language, "Хараахан сурагчид байхгүй байна")}
                </h3>
                <Button asChild className="mt-4">
                  <Link to="/quiz">{getTranslation(language, "Тест өгөх")}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Rankings;

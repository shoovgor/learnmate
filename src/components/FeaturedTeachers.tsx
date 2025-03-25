
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Star } from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { db } from '@/config/firebaseConfig';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { User } from '@/models/user';

interface FeaturedTeachersProps {
  language: string;
}

interface TeacherWithRating extends User {
  quizCount: number;
  rating: number;
}

const FeaturedTeachers: React.FC<FeaturedTeachersProps> = ({ language }) => {
  const [teachers, setTeachers] = useState<TeacherWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        // Query for teachers
        const teachersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'teacher'),
          limit(5)
        );
        
        const teacherDocs = await getDocs(teachersQuery);
        
        // Process each teacher to get their ratings and quiz count
        const teachersData: TeacherWithRating[] = [];
        
        for (const doc of teacherDocs.docs) {
          const teacherData = doc.data() as User;
          
          // Get quizzes created by this teacher
          const quizzesQuery = query(
            collection(db, 'quizzes'),
            where('createdById', '==', doc.id)
          );
          
          const quizDocs = await getDocs(quizzesQuery);
          const quizCount = quizDocs.size;
          
          // Calculate a rating based on quiz popularity
          let totalRating = 0;
          quizDocs.forEach(quizDoc => {
            const quiz = quizDoc.data();
            // Use popularity as a factor in rating
            totalRating += (quiz.popularity || 0) * 0.5;
          });
          
          // Ensure rating is between 3.5 and 5.0 for featured teachers
          const rating = quizCount > 0 
            ? Math.min(5, Math.max(3.5, totalRating / quizCount + 3.5)) 
            : 4.0;
          
          teachersData.push({
            ...teacherData,
            uid: doc.id,
            quizCount,
            rating: parseFloat(rating.toFixed(1))
          });
        }
        
        // Sort by rating (highest first)
        teachersData.sort((a, b) => b.rating - a.rating);
        
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        // Fallback data if there's an error
        setTeachers([
          {
            uid: "1",
            displayName: "D. Nyamaa",
            photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
            role: 'teacher',
            email: "nyamaa@email.com",
            school: "School of Applied Sciences",
            createdAt: new Date().toISOString(),
            quizCount: 24,
            rating: 4.8
          },
          {
            uid: "2",
            displayName: "B. Batjargal",
            photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
            role: 'teacher',
            email: "batjargal@email.com",
            school: "National University",
            createdAt: new Date().toISOString(),
            quizCount: 18,
            rating: 4.7
          },
          {
            uid: "3",
            displayName: "J. Anand",
            photoURL: "https://randomuser.me/api/portraits/men/45.jpg",
            role: 'teacher',
            email: "anand@email.com",
            school: "Technical Institute",
            createdAt: new Date().toISOString(),
            quizCount: 12,
            rating: 4.5
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeachers();
  }, []);
  
  // Show placeholder while loading
  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          {language === 'mn' ? 'Шилдэг багш нар' : 'Featured Teachers'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mt-4"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mt-2"></div>
                <div className="h-4 bg-gray-200 rounded w-14 mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {language === 'mn' ? 'Шилдэг багш нар' : 'Featured Teachers'}
        </h2>
        <Button variant="ghost" onClick={() => navigate('/teachers')} className="group">
          {language === 'mn' ? 'Бүгдийг үзэх' : 'View all'}
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {teachers.map(teacher => (
          <Card key={teacher.uid} className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="w-20 h-20">
                <AvatarImage src={teacher.photoURL || ''} alt={teacher.displayName || ''} />
                <AvatarFallback>
                  {teacher.displayName?.split(' ').map(n => n[0]).join('') || 'T'}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="font-medium text-lg mt-4">{teacher.displayName}</h3>
              <p className="text-muted-foreground text-sm">{teacher.school || 'Teacher'}</p>
              
              <div className="flex items-center mt-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">{teacher.rating}</span>
                <span className="mx-1.5 text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {teacher.quizCount} {language === 'mn' ? 'хичээл' : 'courses'}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4"
                onClick={() => navigate(`/teacher/${teacher.uid}`)}
              >
                {language === 'mn' ? 'Профайл үзэх' : 'View profile'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTeachers;

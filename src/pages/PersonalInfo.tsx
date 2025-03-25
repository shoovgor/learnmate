
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Mail, School, CalendarDays, Edit } from 'lucide-react';
import { getTranslation } from '@/utils/translations';

const PersonalInfo = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    // Get user data from localStorage
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    
    setIsLoading(false);
  }, [navigate]);

  const getUserInitials = () => {
    if (!userData || !userData.displayName) return 'U';
    
    const names = userData.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userData.displayName[0].toUpperCase();
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{getTranslation(language, 'personalInfo')}</h1>
          
          <Card className="mb-8 shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{userData?.displayName || getTranslation(language, 'user')}</CardTitle>
                <CardDescription>{userData?.email || 'user@example.com'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 border rounded-md">
                    <User className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, 'firstName')}</p>
                      <p className="font-medium">{userData?.firstName || userData?.displayName?.split(' ')[0] || getTranslation(language, 'notSpecified')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <User className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, 'lastName')}</p>
                      <p className="font-medium">{userData?.lastName || userData?.displayName?.split(' ')[1] || getTranslation(language, 'notSpecified')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <Mail className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, 'email')}</p>
                      <p className="font-medium">{userData?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <School className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, 'school')}</p>
                      <p className="font-medium">{userData?.schoolName || getTranslation(language, 'notSpecified')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <CalendarDays className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{getTranslation(language, 'memberSince')}</p>
                      <p className="font-medium">{userData?.createdAt || new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button className="flex items-center" onClick={() => navigate('/settings')}>
                    <Edit className="h-4 w-4 mr-2" />
                    {getTranslation(language, 'editProfile')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PersonalInfo;

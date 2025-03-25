
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { School, Calendar, MessageCircle, User, Users, Award, BookOpen } from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';

const FriendProfile = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [friendData, setFriendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    const fetchFriendData = async () => {
      try {
        if (friendId) {
          // Fetch friend data from Firestore
          const friendDocRef = doc(db, "users", friendId);
          const friendDoc = await getDoc(friendDocRef);
          
          if (friendDoc.exists()) {
            setFriendData(friendDoc.data());
          } else {
            // If no document exists, use mock data for now
            setFriendData({
              displayName: 'Example Friend',
              firstName: 'Example',
              lastName: 'Friend',
              email: 'friend@example.com',
              schoolName: 'Example School',
              createdAt: new Date().toLocaleDateString(),
              bio: 'This is an example friend profile.',
              subjects: ['Mathematics', 'Science', 'Literature']
            });
          }
          
          // Check if they are already friends
          // This would normally query a friends collection in Firestore
          // For now we'll set a mock value
          setIsFriend(Math.random() > 0.5);
        }
      } catch (error) {
        console.error("Error fetching friend data:", error);
        toast.error(getTranslation(language, 'errorFetchingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId, language, navigate]);

  const getFriendInitials = () => {
    if (!friendData || !friendData.displayName) return 'F';
    
    const names = friendData.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return friendData.displayName[0].toUpperCase();
  };

  const handleFriendAction = () => {
    if (isFriend) {
      // Remove friend logic would go here
      toast.success(getTranslation(language, 'friendRemoved'));
      setIsFriend(false);
    } else {
      // Add friend logic would go here
      toast.success(getTranslation(language, 'friendRequestSent'));
      setIsFriend(true);
    }
  };

  const handleMessage = () => {
    // This would navigate to a chat or message screen
    toast.info(getTranslation(language, 'messagingFeatureComingSoon'));
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
            {/* Friend Profile Card */}
            <Card className="md:w-1/3">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">{getFriendInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="mt-4">{friendData?.displayName || `${friendData?.firstName} ${friendData?.lastName}`}</CardTitle>
                <CardDescription>{friendData?.email || 'friend@example.com'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <School className="h-5 w-5 mr-3 text-primary" />
                  <span>{friendData?.schoolName || getTranslation(language, 'notSpecified')}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <span>{getTranslation(language, 'memberSince')}: {friendData?.createdAt || new Date().toLocaleDateString()}</span>
                </div>
                {friendData?.bio && (
                  <div className="pt-2 border-t">
                    <p className="text-sm">{friendData.bio}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center gap-2">
                <Button 
                  variant={isFriend ? "outline" : "default"} 
                  onClick={handleFriendAction}
                >
                  <User className="h-4 w-4 mr-2" />
                  {isFriend 
                    ? getTranslation(language, 'removeFriend') 
                    : getTranslation(language, 'addFriend')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleMessage}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {getTranslation(language, 'message')}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Friend Details */}
            <div className="md:w-2/3">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">{getTranslation(language, 'overview')}</TabsTrigger>
                  <TabsTrigger value="friends">{getTranslation(language, 'friends')}</TabsTrigger>
                  <TabsTrigger value="achievements">{getTranslation(language, 'achievements')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getTranslation(language, 'about')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {friendData?.subjects && friendData.subjects.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-2">{getTranslation(language, 'favoriteSubjects')}</h3>
                            <div className="flex flex-wrap gap-2">
                              {friendData.subjects.map((subject: string, index: number) => (
                                <span 
                                  key={index} 
                                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-medium mb-2">{getTranslation(language, 'recentActivity')}</h3>
                          <p className="text-muted-foreground">{getTranslation(language, 'noRecentActivity')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="friends">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        {getTranslation(language, 'mutualFriends')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{getTranslation(language, 'noMutualFriendsYet')}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="achievements">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        {getTranslation(language, 'achievements')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />
                            <span>{getTranslation(language, 'completedLessons')}</span>
                          </div>
                          <span>0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Award className="h-5 w-5 mr-2 text-primary" />
                            <span>{getTranslation(language, 'pointsEarned')}</span>
                          </div>
                          <span>0</span>
                        </div>
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

export default FriendProfile;

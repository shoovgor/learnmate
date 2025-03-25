
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Loader2, 
  CheckCircle2,
  BookOpen,
  Award,
  Users,
  MessageSquare
} from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { Notification } from '@/models/user';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const NotificationsPage = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch notifications from your backend here
        // For now, we'll use mock data
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Mock notifications
        const mockNotifications: Notification[] = [
          {
            id: '1',
            userId: userData.uid,
            title: getTranslation(language, 'newQuizAvailable'),
            message: getTranslation(language, 'newQuizAvailableMessage'),
            type: 'quiz',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            link: '/quiz'
          },
          {
            id: '2',
            userId: userData.uid,
            title: getTranslation(language, 'achievementUnlocked'),
            message: getTranslation(language, 'achievementUnlockedMessage'),
            type: 'achievement',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            link: '/profile'
          },
          {
            id: '3',
            userId: userData.uid,
            title: getTranslation(language, 'friendRequestAccepted'),
            message: getTranslation(language, 'friendRequestAcceptedMessage'),
            type: 'friend',
            read: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(), 
            link: '/profile/friends'
          },
          {
            id: '4',
            userId: userData.uid,
            title: getTranslation(language, 'quizCompleted'),
            message: getTranslation(language, 'quizCompletedMessage'),
            type: 'quiz',
            read: true,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            link: '/profile'
          },
          {
            id: '5',
            userId: userData.uid,
            title: getTranslation(language, 'systemUpdate'),
            message: getTranslation(language, 'systemUpdateMessage'),
            type: 'system',
            read: true,
            createdAt: new Date(Date.now() - 345600000).toISOString()
          },
          {
            id: '6',
            userId: userData.uid,
            title: getTranslation(language, 'teacherComment'),
            message: getTranslation(language, 'teacherCommentMessage'),
            type: 'teacher',
            read: false,
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            link: '/quiz/result/123'
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('language') || 'mn');
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, [navigate, language]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-amber-500" />;
      case 'friend':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'teacher':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read (in a real app, you would update this in your backend)
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Navigate to the linked page if available
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, read: true }))
    );
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = getTranslation(language, 'today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = getTranslation(language, 'yesterday');
    } else {
      groupKey = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {getTranslation(language, 'notifications')}
              </h1>
              <p className="text-muted-foreground">
                {getTranslation(language, 'stayUpdated')}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {getTranslation(language, 'markAllAsRead')}
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getTranslation(language, 'recentNotifications')}</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">
                    {unreadCount} {getTranslation(language, 'unread')}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {getTranslation(language, 'clickToViewDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">
                        {date}
                      </h3>
                      <div className="space-y-2">
                        {dateNotifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${
                              !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-card'
                            } cursor-pointer hover:shadow-sm transition-shadow animate-fade-in`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex">
                              <div className="mr-3 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium">
                                    {notification.title}
                                    {!notification.read && (
                                      <div className="inline-block w-2 h-2 rounded-full bg-primary ml-2"></div>
                                    )}
                                  </h4>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(notification.createdAt), 'h:mm a')}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {getTranslation(language, 'noNotifications')}
                  </h3>
                  <p className="text-muted-foreground">
                    {getTranslation(language, 'noNotificationsMessage')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotificationsPage;

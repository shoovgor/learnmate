import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Globe, 
  LogIn,
  BookOpen,
  Users,
  BookText,
  Home,
  MessageSquare,
  HelpCircle,
  Trophy,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { Button } from "@/components/ui/button";
import { auth } from '@/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Notification } from '@/models/user';
import { format } from 'date-fns';

const MainNavigation = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Handle language toggle
  const toggleLanguage = () => {
    const newLanguage = language === 'mn' ? 'en' : 'mn';
    localStorage.setItem('language', newLanguage);
    setLanguage(newLanguage);
    
    // Dispatch a custom event to notify other components of the language change
    window.dispatchEvent(new Event('languageChange'));
  };

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginStatus);
      
      if (loginStatus) {
        try {
          const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
          setUserData(storedUserData);

          // TODO: Replace with actual API call to fetch notifications
          setNotifications([]);
          setUnreadCount(0);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };
    
    checkLoginStatus();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      
      if (user) {
        try {
          const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
          setUserData(storedUserData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        setUserData(null);
      }
    });
    
    return () => unsubscribe();
  }, [language]);
  
  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Focus search input when dialog opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Clear local storage items
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      
      toast({
        title: getTranslation(language, 'loggedOut'),
        description: getTranslation(language, 'successfullyLoggedOut'),
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: getTranslation(language, 'error'),
        description: getTranslation(language, 'errorLoggingOut'),
        variant: 'destructive',
      });
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Mark as read
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Function to determine if link should be in nav or sheet based on screen size
  const isInMainNav = (breakpoint: number) => {
    return windowWidth >= breakpoint;
  };
  
  // Navigation items with responsive breakpoints
  const navItems = [
    { label: 'Нүүр', path: '/', icon: <Home className="h-4 w-4 mr-2" />, breakpoint: 400 },
    { label: 'quiz', path: '/quiz', icon: <BookOpen className="h-4 w-4 mr-2" />, breakpoint: 550 },
    { label: 'community', path: '/community', icon: <MessageSquare className="h-4 w-4 mr-2" />, breakpoint: 700 },
    { label: 'Суралцах төлөвлөгөө', path: '/study-plan', icon: <BookText className="h-4 w-4 mr-2" />, breakpoint: 850 },
    { label: 'rankings', path: '/rankings', icon: <Trophy className="h-4 w-4 mr-2" />, breakpoint: 1000 },
    { label: 'Бидэнтэй холбогдох', path: '/contact', icon: <HelpCircle className="h-4 w-4 mr-2" />, breakpoint: 1100 },
  ];
  
  // Filter items for main navigation based on screen size
  const mainNavItems = navItems.filter(item => isInMainNav(item.breakpoint));
  // Items that will go to hamburger menu
  const sheetNavItems = navItems.filter(item => !isInMainNav(item.breakpoint));

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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              LearnMate
            </Link>
            {userData?.role === 'admin' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Админ
              </Badge>
            )}
            {userData?.role === 'teacher' && (
              <Badge variant="outline" className="ml-2 text-xs">
                {getTranslation(language, 'Багш')}
              </Badge>
            )}
          </div>
          
          {/* Main Navigation Links - Responsive */}
          <nav className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                asChild
                size="sm"
                className="text-sm font-medium"
              >
                <Link to={item.path}>
                  {getTranslation(language, item.label)}
                </Link>
              </Button>
            ))}
          </nav>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={getTranslation(language, 'search')}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications */}
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>{getTranslation(language, 'notifications')}</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {unreadCount} {getTranslation(language, 'new')}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                      <div key={date} className="mb-2">
                        <div className="px-2 py-1 text-xs text-muted-foreground bg-muted/50">
                          {date}
                        </div>
                        {dateNotifications.map(notification => (
                          <DropdownMenuItem 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`cursor-pointer flex flex-col items-start px-3 py-2 ${!notification.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex items-start w-full">
                              <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${!notification.read ? 'bg-primary' : 'bg-muted'}`}></div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(notification.createdAt), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer justify-center text-center">
                    <Link to="/notifications" className="w-full flex items-center justify-center text-primary text-sm">
                      {getTranslation(language, 'Бүх мэдэгдэлүүдийг харах')}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={language === 'mn' ? 'Switch to English' : 'Монгол хэл рүү шилжих'}
            >
              {language === 'mn' ? (
                <span className="text-sm font-medium">MN</span>
              ) : (
                <span className="text-sm font-medium">EN</span>
              )}
            </Button>
            
            {/* User menu or login button */}
            {isLoggedIn && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData.photoURL} />
                      <AvatarFallback>{userData.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userData.displayName || userData.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {getTranslation(language, 'profile')}
                  </DropdownMenuItem>
                  
                  {(userData.role === 'teacher' || userData.role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/teacher')}>
                      <BookText className="mr-2 h-4 w-4" />
                      {getTranslation(language, 'teacherPanel')}
                    </DropdownMenuItem>
                  )}
                  
                  {userData.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <BookText className="mr-2 h-4 w-4" />
                      {getTranslation(language, 'Админ панель')}
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate('/contact')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {getTranslation(language, 'Бидэнтэй холбогдох')}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {getTranslation(language, 'settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {getTranslation(language, 'logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                <LogIn className="mr-2 h-4 w-4" />
                {getTranslation(language, 'login')}
              </Button>
            )}
            
            {/* Mobile menu button - only show if there are items in the sheet */}
            {sheetNavItems.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>LearnMate</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-3 mt-6">
                    {/* All nav items in mobile view */}
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.path}>
                        <Button
                          variant={location.pathname === item.path ? "secondary" : "ghost"}
                          asChild
                          className="justify-start"
                        >
                          <Link to={item.path}>
                            {item.icon}
                            {getTranslation(language, item.label)}
                          </Link>
                        </Button>
                      </SheetClose>
                    ))}
                    
                    {/* Additional links that might be useful */}
                    {isLoggedIn && userData && (
                      <>
                        <SheetClose asChild>
                          <Button
                            variant={location.pathname === '/profile' ? "secondary" : "ghost"}
                            asChild
                            className="justify-start"
                          >
                            <Link to="/profile">
                              <User className="h-4 w-4 mr-2" />
                              {getTranslation(language, 'profile')}
                            </Link>
                          </Button>
                        </SheetClose>
                        
                        {(userData.role === 'teacher' || userData.role === 'admin') && (
                          <SheetClose asChild>
                            <Button
                              variant={location.pathname === '/teacher' ? "secondary" : "ghost"}
                              asChild
                              className="justify-start"
                            >
                              <Link to="/teacher">
                                <BookText className="h-4 w-4 mr-2" />
                                {getTranslation(language, 'teacherPanel')}
                              </Link>
                            </Button>
                          </SheetClose>
                        )}
                        
                        {userData.role === 'admin' && (
                          <SheetClose asChild>
                            <Button
                              variant={location.pathname === '/admin' ? "secondary" : "ghost"}
                              asChild
                              className="justify-start"
                            >
                              <Link to="/admin">
                                <BookText className="h-4 w-4 mr-2" />
                                {getTranslation(language, 'adminPanel')}
                              </Link>
                            </Button>
                          </SheetClose>
                        )}
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
      
      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTranslation(language, 'search')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'searchPlaceholder')}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-2" />
              {getTranslation(language, 'search')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default MainNavigation;

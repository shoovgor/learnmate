
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Lock, 
  LogOut, 
  ArrowRight, 
  SunMoon, 
  Languages, 
  Globe, 
  Save, 
  X, 
  Check, 
  CheckCircle
} from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';
import { getTranslation, getAllLanguages } from "@/utils/translations";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState<string>("mn");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const availableLanguages = getAllLanguages();
  
  useEffect(() => {
    // Get saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Get notification preferences (mock)
    const hasNotificationPermission = true; // In a real app, check browser permission
    setNotificationsEnabled(hasNotificationPermission);
  }, []);
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    toast({
      title: newLanguage === 'mn' ? 'Хэлний тохиргоо өөрчлөгдлөө' : 'Language setting updated',
      description: newLanguage === 'mn' ? 'Хэл амжилттай шинэчлэгдлээ' : 'Language has been updated successfully',
    });
  };
  
  const handleSavePassword = () => {
    setPasswordError("");
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError(language === 'mn' ? "Бүх талбарыг бөглөнө үү" : "Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'mn' ? "Шинэ нууц үг таарахгүй байна" : "New passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError(
        language === 'mn' 
          ? "Нууц үг хамгийн багадаа 8 тэмдэгттэй байх ёстой" 
          : "Password must be at least 8 characters long"
      );
      return;
    }
    
    // In a real app, send API request here
    toast({
      title: language === 'mn' ? 'Нууц үг шинэчлэгдлээ' : 'Password updated',
      description: language === 'mn' ? 'Таны нууц үг амжилттай шинэчлэгдлээ' : 'Your password has been updated successfully',
    });
    
    // Reset password fields
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container max-w-4xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-6">{getTranslation(language, "settings")}</h1>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <TabsTrigger value="general">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'mn' ? 'Ерөнхий' : 'General'}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{getTranslation(language, "notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'mn' ? 'Нууцлал' : 'Privacy'}</span>
            </TabsTrigger>
            <TabsTrigger value="language">
              <Globe className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{getTranslation(language, "language")}</span>
            </TabsTrigger>
            <TabsTrigger value="account">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'mn' ? 'Бүртгэл' : 'Account'}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'mn' ? 'Ерөнхий тохиргоо' : 'General Settings'}</CardTitle>
                <CardDescription>
                  {language === 'mn' 
                    ? 'Дэлгэцийн харагдах байдлыг өөрчлөх'
                    : 'Manage theme and appearance settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <SunMoon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{getTranslation(language, "theme")}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'mn' ? 'Гэрэл ба харанхуй горим' : 'Light and dark mode'}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={isDarkMode} 
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation(language, "notifications")}</CardTitle>
                <CardDescription>
                  {language === 'mn' 
                    ? 'Мэдэгдэл болон сануулгуудыг тохируулах'
                    : 'Manage your notification preferences'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{language === 'mn' ? 'Мэдэгдлүүд' : 'Notifications'}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'mn' ? 'Бүх мэдэгдлүүдийг идэвхжүүлэх эсвэл цуцлах' : 'Enable or disable all notifications'}
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    {language === 'mn' ? 'Мэдэгдлийн төрлүүд' : 'Notification Types'}
                  </h3>
                  
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="flex flex-col gap-1">
                        <span>{language === 'mn' ? 'Имэйл мэдэгдэл' : 'Email Notifications'}</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          {language === 'mn' ? 'Шинэ зарлал, тест, үнэлгээний тухай имэйл хүлээн авах' : 'Receive emails about new announcements, quizzes, and grades'}
                        </span>
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications" className="flex flex-col gap-1">
                        <span>{language === 'mn' ? 'Түлхэх мэдэгдэл' : 'Push Notifications'}</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          {language === 'mn' ? 'Вэб хөтчөөр дамжуулан мэдэгдэл хүлээн авах' : 'Receive browser notifications'}
                        </span>
                      </Label>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" onClick={() => 
                  toast({
                    title: language === 'mn' ? 'Тохиргоо хадгалагдлаа' : 'Settings saved',
                    description: language === 'mn' ? 'Мэдэгдлийн тохиргоо амжилттай хадгалагдлаа' : 'Your notification preferences have been updated',
                  })
                }>
                  <Save className="h-4 w-4 mr-2" />
                  {language === 'mn' ? 'Хадгалах' : 'Save changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'mn' ? 'Нууц үг солих' : 'Change Password'}</CardTitle>
                <CardDescription>
                  {language === 'mn' 
                    ? 'Аюулгүй байдлын үүднээс нууц үгээ тогтмол солиж байхыг зөвлөж байна'
                    : 'Update your password regularly for security'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">
                    {language === 'mn' ? 'Одоогийн нууц үг' : 'Current Password'}
                  </Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    {language === 'mn' ? 'Шинэ нууц үг' : 'New Password'}
                  </Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    {language === 'mn' ? 'Шинэ нууц үгээ баталгаажуулах' : 'Confirm New Password'}
                  </Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                {passwordError && (
                  <div className="text-sm text-red-500 flex items-center mt-2">
                    <X className="h-4 w-4 mr-1" />
                    {passwordError}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePassword}>
                  <Save className="h-4 w-4 mr-2" />
                  {language === 'mn' ? 'Нууц үг шинэчлэх' : 'Update Password'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation(language, "language")}</CardTitle>
                <CardDescription>
                  {language === 'mn'
                    ? 'Аппликейшны хэлийг өөрчлөх'
                    : 'Change the language used in the application'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={language} onValueChange={handleLanguageChange} className="space-y-4">
                  {availableLanguages.map((lang) => (
                    <div 
                      key={lang.code} 
                      className="flex items-center justify-between space-x-2 border p-4 rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} className="mr-4" />
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{lang.icon}</span>
                          <Label htmlFor={`lang-${lang.code}`} className="font-medium cursor-pointer">
                            {lang.name}
                          </Label>
                        </div>
                      </div>
                      {language === lang.code && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'mn' ? 'Бүртгэлийн мэдээлэл' : 'Account Information'}</CardTitle>
                <CardDescription>
                  {language === 'mn'
                    ? 'Бүртгэлийн талаарх мэдээлэл болон гарах'
                    : 'Account details and logout options'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{language === 'mn' ? 'Имэйл' : 'Email'}</h3>
                  <p className="text-muted-foreground">user@example.com</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">{language === 'mn' ? 'Бүртгэл үүсгэсэн' : 'Account Created'}</h3>
                  <p className="text-muted-foreground">Jan 1, 2023</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">{language === 'mn' ? 'Бүртгэлийн төрөл' : 'Account Type'}</h3>
                  <p className="text-muted-foreground">
                    {localStorage.getItem('isTeacher') === 'true' 
                      ? (language === 'mn' ? 'Багш' : 'Teacher')
                      : (language === 'mn' ? 'Сурагч' : 'Student')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => 
                  toast({
                    title: language === 'mn' ? 'Бүртгэл устгах' : 'Delete Account',
                    description: language === 'mn' ? 'Энэ үйлдэл одоогоор боломжгүй байна' : 'This action is not available in the demo',
                    variant: "destructive"
                  })
                }>
                  {language === 'mn' ? 'Бүртгэл устгах' : 'Delete Account'}
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {getTranslation(language, "logout")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, School, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { auth } from "@/config/firebaseConfig";
import { sendPasswordResetEmail, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getTranslation } from '@/utils/translations';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signIn, signUp } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email({ message: "Зөв имэйл ха��г оруулна уу" }),
  password: z.string().min(6, { message: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой" }),
});

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "Өөрийн нэр дор хаяж 2 тэмдэгт байх ёстой" }),
  lastName: z.string().min(2, { message: "Овог дор хаяж 2 тэмдэгт байх ёстой" }),
  email: z.string().email({ message: "Зөв имэйл хаяг оруулна уу" }),
  schoolId: z.string().min(1, { message: "Сургууль сонгоно уу" }),
  password: z.string().min(6, { message: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой" }),
  confirmPassword: z.string().min(6, { message: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Нууц үг таарахгүй байна",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const schools = [
  { id: "num", name: "Монгол Улсын Их Сургууль" },
  { id: "must", name: "Шинжлэх Ухаан Технологийн Их Сургууль" },
  { id: "mnue", name: "Монгол Улсын Боловсролын Их Сургууль" },
  { id: "mnums", name: "Монгол Улсын Анагаахын Шинжлэх Ухааны Их Сургууль" },
  { id: "msue", name: "Монгол Улсын Хөдөө Аж Ахуйн Их Сургууль" },
  { id: "letu", name: "Монгол Улсын Соёл Урлагийн Их Сургууль" },
  { id: "irim", name: "Олон Улсын Харилцаа, Нийтийн Удирдлагын Дээд Сургууль" },
  { id: "uit", name: "Улаанбаатар Мэдээлэл Технологийн Дээд Сургууль" },
  { id: "ibs", name: "Олон Улсын Бизнесийн Дээд Сургууль" },
  { id: "mandakh", name: "Мандах Их Сургууль" },
  { id: "otgontenger", name: "Отгонтэнгэр Их Сургууль" },
  { id: "huree", name: "Хүрээ Мэдээлэл, Харилцаа Холбооны Технологийн Дээд Сургууль" },
  { id: "sns1", name: "1-р Сургууль" },
  { id: "sns2", name: "2-р Сургууль" },
  { id: "sns3", name: "3-р Сургууль" },
  { id: "sns4", name: "4-р Сургууль" },
  { id: "sns5", name: "5-р Сургууль" },
  { id: "sns6", name: "6-р Сургууль" },
  { id: "sns8", name: "8-р Сургууль" },
  { id: "sns11", name: "11-р Сургууль" },
  { id: "sns23", name: "23-р Сургууль" },
  { id: "sns24", name: "24-р Сургууль" },
  { id: "sns28", name: "28-р Сургууль" },
  { id: "sns33", name: "33-р Сургууль" },
];

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetCountdown, setResetCountdown] = useState<number | null>(null);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [filteredSchools, setFilteredSchools] = useState(schools);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'mn');

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Error setting persistence:", error);
        toast({
          title: getTranslation(language, 'error'),
          description: error.message,
          variant: "destructive",
        });
      });
      
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('signup') === 'true') {
      setActiveTab('signup');
    }
  }, []);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      schoolId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password);
      
      toast({
        title: getTranslation(language, 'loginSuccess'),
        description: getTranslation(language, 'welcome'),
      });
      
      localStorage.setItem('isLoggedIn', 'true');
      setTimeout(() => navigate("/"), 1500);
    } catch (error: any) {
      toast({
        title: getTranslation(language, 'loginFailure'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      await signUp(
        data.email, 
        data.password,
        data.firstName, 
        data.lastName, 
        data.schoolId
      );

      localStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: getTranslation(language, 'signupSuccess'),
        description: getTranslation(language, 'signupMessage'),
      });

      setTimeout(() => navigate("/"), 1500);
    } catch (error: any) {
      toast({
        title: getTranslation(language, 'signupFailure'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (email: string) => {
    if (isResettingPassword) {
      toast({
        title: getTranslation(language, 'pleaseWait'),
        description: `${getTranslation(language, 'passwordResetLimit')} ${resetCountdown} ${getTranslation(language, 'seconds')}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResettingPassword(true);
      setResetCountdown(30);
      await sendPasswordResetEmail(auth, email);
      toast({
        title: getTranslation(language, 'passwordResetSent'),
        description: getTranslation(language, 'passwordResetCheck'),
      });

      const interval = setInterval(() => {
        setResetCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setIsResettingPassword(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast({
        title: getTranslation(language, 'error'),
        description: error.message,
        variant: "destructive",
      });
      setIsResettingPassword(false);
      setResetCountdown(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12 mt-20">
        <div className="w-full max-w-md">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8">
              <TabsTrigger value="login">{getTranslation(language, 'login')}</TabsTrigger>
              <TabsTrigger value="signup">{getTranslation(language, 'signup')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-primary/10 shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">{getTranslation(language, 'welcome')}</CardTitle>
                  <CardDescription>
                    {getTranslation(language, 'enterCredentials')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation(language, 'email')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={getTranslation(language, 'emailPlaceholder')} className="border-0 focus-visible:ring-0" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation(language, 'password')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="border-0 focus-visible:ring-0" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="text-sm text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const email = loginForm.getValues("email");
                            if (email) {
                              handlePasswordReset(email);
                            } else {
                              toast({
                                title: getTranslation(language, 'error'),
                                description: getTranslation(language, 'emailRequired'),
                                variant: "destructive",
                              });
                            }
                          }}
                          className={`text-primary hover:underline ${isResettingPassword ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={isResettingPassword}
                          title={isResettingPassword ? `${getTranslation(language, 'waitForReset')} ${resetCountdown} ${getTranslation(language, 'seconds')}` : ""}
                        >
                          {getTranslation(language, 'forgotPassword')}
                        </button>
                      </div>
                      
                      <Button type="submit" className="w-full">
                        {getTranslation(language, 'login')} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    {getTranslation(language, 'noAccount')}{" "}
                    <button 
                      onClick={() => setActiveTab("signup")} 
                      className="text-primary hover:underline font-medium"
                    >
                      {getTranslation(language, 'signup')}
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card className="border-primary/10 shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">{getTranslation(language, 'createAccount')}</CardTitle>
                  <CardDescription>
                    {getTranslation(language, 'fillDetails')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{getTranslation(language, 'Овог')}</FormLabel>
                              <FormControl>
                                <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                  <User className="ml-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder={getTranslation(language, 'Овог')} className="border-0 focus-visible:ring-0" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{getTranslation(language, 'Нэр')}</FormLabel>
                              <FormControl>
                                <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                  <User className="ml-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder={getTranslation(language, 'Нэр')} className="border-0 focus-visible:ring-0" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation(language, 'email')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={getTranslation(language, 'emailPlaceholder')} className="border-0 focus-visible:ring-0" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="schoolId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation(language, 'school')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <div className="flex items-center">
                                    <School className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder={getTranslation(language, 'schoolPlaceholder')} />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-80">
                                <div className="sticky top-0 z-10 bg-background p-2 border-b">
                                  <div className="flex items-center border rounded-md px-3 py-2">
                                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <Input 
                                      placeholder={getTranslation(language, 'searchSchool')} 
                                      className="border-0 focus-visible:ring-0"
                                      value={schoolSearchQuery}
                                      onChange={(e) => {
                                        const query = e.target.value.toLowerCase();
                                        setSchoolSearchQuery(query);
                                        setFilteredSchools(
                                          schools.filter(school => 
                                            school.name.toLowerCase().includes(query)
                                          )
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                                <ScrollArea className="h-72">
                                  {filteredSchools.map((school) => (
                                    <SelectItem key={school.id} value={school.id}>
                                      {school.name}
                                    </SelectItem>
                                  ))}
                                  {filteredSchools.length === 0 && (
                                    <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                                      {getTranslation(language, 'noSchoolsFound')}
                                    </div>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation(language, 'password')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="border-0 focus-visible:ring-0" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation(language, 'confirmPassword')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                                <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="border-0 focus-visible:ring-0" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full">
                        {getTranslation(language, 'signup')} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-muted-foreground">
                    {getTranslation(language, 'haveAccount')}{" "}
                    <button 
                      onClick={() => setActiveTab("login")} 
                      className="text-primary hover:underline font-medium"
                    >
                      {getTranslation(language, 'login')}
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import QuestionDetail from "./pages/QuestionDetail";
import Auth from "./pages/Auth";
import AIAssistant from "./pages/AIAssistant";
import Quiz from "./pages/Quiz";
import QuizDetail from "./pages/QuizDetail";
import Rankings from "./pages/Rankings";
import Contact from "./pages/Contact";
import StudyPlan from "./pages/StudyPlan";
import Profile from "./pages/Profile";
import ProfileFriends from "./pages/ProfileFriends";
import ProfileGroups from "./pages/ProfileGroups";
import GroupDetail from "./pages/GroupDetail";
import TeacherPanel from "./pages/TeacherPanel";
import FriendProfile from "./pages/FriendProfile";
import Settings from "./pages/Settings";
import CommunityClassLevel from "./pages/CommunityClassLevel";
import AskQuestion from "./pages/AskQuestion";
import PersonalInfo from "./pages/PersonalInfo";
import AdminPanel from "./pages/AdminPanel";
import Notifications from "./pages/Notifications";
import { useEffect } from "react";
import { auth } from "./config/firebaseConfig";
import { initializeAdmin } from "./services/authService";

const App = () => {
  // Set up authentication tracking
  useEffect(() => {
    // Check for a default admin
    const initAdmin = async () => {
      try {
        // For demo purposes, add first user as admin with this email
        await initializeAdmin('purevjav.dgl@gmail.com');
      } catch (error) {
        console.error('Error initializing admin:', error);
      }
    };

    initAdmin();
    
    // Default language to Mongolian if not set
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'mn');
    }
  }, []);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/question/new" element={<AskQuestion />} />
            <Route path="/community/question/:questionId" element={<QuestionDetail />} />
            <Route path="/community/class/:classLevel" element={<CommunityClassLevel />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:quizId" element={<QuizDetail />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/friends" element={<ProfileFriends />} />
            <Route path="/profile/friends/:friendId" element={<FriendProfile />} />
            <Route path="/profile/groups" element={<ProfileGroups />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/personal-info" element={<PersonalInfo />} />
            <Route path="/teacher" element={<TeacherPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

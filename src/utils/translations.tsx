
import React from 'react';

// Define the available languages
type LanguageCode = 'mn' | 'en';

interface Translation {
  [key: string]: {
    mn: string;
    en: string;
  };
}

interface Language {
  code: LanguageCode;
  name: string;
  icon: string;
}

// Define all the available languages with their icons
export const getAllLanguages = (): Language[] => {
  return [
    { code: 'mn', name: 'Монгол', icon: '🇲🇳' },
    { code: 'en', name: 'English', icon: '🇬🇧' },
  ];
};

// Define all translations
const translations: Translation = {
  dashboard: {
    mn: 'Нүүр хуудас',
    en: 'Dashboard',
  },
  aiAssistant: {
    mn: 'AI туслах',
    en: 'AI Assistant',
  },
  community: {
    mn: 'Хамт олон',
    en: 'Community',
  },
  quiz: {
    mn: 'Тест',
    en: 'Quiz',
  },
  quizzes: {
    mn: 'Тестүүд',
    en: 'Quizzes',
  },
  rankings: {
    mn: 'Чансаа',
    en: 'Rankings',
  },
  studyPlan: {
    mn: 'Суралцах төлөвлөгөө',
    en: 'Study Plan',
  },
  settings: {
    mn: 'Тохиргоо',
    en: 'Settings',
  },
  login: {
    mn: 'Нэвтрэх',
    en: 'Log In',
  },
  signup: {
    mn: 'Бүртгүүлэх',
    en: 'Sign Up',
  },
  logout: {
    mn: 'Гарах',
    en: 'Log Out',
  },
  search: {
    mn: 'Хайх',
    en: 'Search',
  },
  searchPlaceholder: {
    mn: 'Хайх зүйлээ бичнэ үү...',
    en: 'Search...',
  },
  theme: {
    mn: 'Харагдах байдал',
    en: 'Theme',
  },
  contact: {
    mn: 'Холбоо барих',
    en: 'Contact',
  },
  myFriends: {
    mn: 'Миний найзууд',
    en: 'My Friends',
  },
  friends: {
    mn: 'Найзууд',
    en: 'Friends',
  },
  friendRequests: {
    mn: 'Найзын хүсэлтүүд',
    en: 'Friend Requests',
  },
  suggestions: {
    mn: 'Санал болгох',
    en: 'Suggestions',
  },
  menu: {
    mn: 'Цэс',
    en: 'Menu',
  },
  groups: {
    mn: 'Бүлгүүд',
    en: 'Groups',
  },
  teacherPanel: {
    mn: 'Багшийн хэсэг',
    en: 'Teacher Panel',
  },
  myQrCode: {
    mn: 'Миний QR код',
    en: 'My QR Code',
  },
  showQrCode: {
    mn: 'QR код харуулах',
    en: 'Show QR Code',
  },
  qrCodeGenerated: {
    mn: 'QR код үүсгэгдлээ',
    en: 'QR Code Generated',
  },
  qrCodeDescription: {
    mn: 'Энэ QR кодыг хуваалцаж бусад хэрэглэгчид таныг дагах боломжтой',
    en: 'Share this QR code to let other users connect with you',
  },
  yourDashboard: {
    mn: 'Таны хянах самбар',
    en: 'Your Dashboard',
  },
  quizStreak: {
    mn: 'Тестийн цуваа',
    en: 'Quiz Streak',
  },
  quizPrecision: {
    mn: 'Тестийн нарийвчлал',
    en: 'Quiz Precision',
  },
  days: {
    mn: 'өдөр',
    en: 'days',
  },
  helpStats: {
    mn: 'Тусламжийн статистик',
    en: 'Help Stats',
  },
  peopleHelped: {
    mn: 'Тусалсан хүмүүс',
    en: 'People Helped',
  },
  receivedHelp: {
    mn: 'Тусламж авсан',
    en: 'Received Help',
  },
  comingSoon: {
    mn: 'Тун удахгүй',
    en: 'Coming Soon',
  },
  featureComingSoon: {
    mn: 'Энэ функц тун удахгүй ирнэ',
    en: 'This feature is coming soon',
  },
  messagingFeatureComingSoon: {
    mn: 'Мессеж бичих функц тун удахгүй ирнэ',
    en: 'The messaging feature is coming soon',
  },
  searchResults: {
    mn: 'Хайлтын үр дүн',
    en: 'Search Results',
  },
  searchingFor: {
    mn: 'Хайж байгаа',
    en: 'Searching for',
  },
  grade: {
    mn: 'Анги',
    en: 'Grade',
  },
  online: {
    mn: 'Онлайн',
    en: 'Online',
  },
  offline: {
    mn: 'Офлайн',
    en: 'Offline',
  },
  school: {
    mn: 'Сургууль',
    en: 'School',
  },
  favoriteSubjects: {
    mn: 'Дуртай хичээлүүд',
    en: 'Favorite Subjects',
  },
  coursesCreated: {
    mn: 'Бий болгосон хичээлүүд',
    en: 'Courses Created',
  },
  studentsHelped: {
    mn: 'Тусалсан сурагчид',
    en: 'Students Helped',
  },
  averageRating: {
    mn: 'Дундаж үнэлгээ',
    en: 'Average Rating',
  },
  quizzesCreated: {
    mn: 'Бий болгосон тестүүд',
    en: 'Quizzes Created',
  },
  quizzesTaken: {
    mn: 'Өгсөн тестүүд',
    en: 'Quizzes Taken',
  },
  averageScore: {
    mn: 'Дундаж оноо',
    en: 'Average Score',
  },
  questionsAnswered: {
    mn: 'Хариулсан асуултууд',
    en: 'Questions Answered',
  },
  sendMessage: {
    mn: 'Мессеж илгээх',
    en: 'Send Message',
  },
  unfriend: {
    mn: 'Найзаас хасах',
    en: 'Unfriend',
  },
  recentActivity: {
    mn: 'Сүүлийн үйл ажиллагаа',
    en: 'Recent Activity',
  },
  achievements: {
    mn: 'Амжилтууд',
    en: 'Achievements',
  },
  unfriended: {
    mn: 'Найзаас хасагдлаа',
    en: 'Unfriended',
  },
  youHaveUnfriended: {
    mn: 'Та дараах хэрэглэгчийг найзаас хасагдлаа',
    en: 'You have unfriended',
  },
  loading: {
    mn: 'Ачаалж байна...',
    en: 'Loading...',
  },
  error: {
    mn: 'Алдаа',
    en: 'Error',
  },
  userNotFound: {
    mn: 'Хэрэглэгч олдсонгүй',
    en: 'User Not Found',
  },
  userNotFoundDescription: {
    mn: 'Таны хайсан хэрэглэгч олдсонгүй',
    en: 'The user you are looking for was not found',
  },
  backToFriends: {
    mn: 'Найзууд руу буцах',
    en: 'Back to Friends',
  },
  backToCommunity: {
    mn: 'Хамт олон руу буцах',
    en: 'Back to Community',
  },
  upcomingStudySessions: {
    mn: 'Удахгүй болох суралцах цагууд',
    en: 'Upcoming Study Sessions',
  },
  noUpcomingSessions: {
    mn: 'Одоогоор товлосон суралцах цаг алга байна',
    en: 'No upcoming study sessions scheduled',
  },
  inviteToStudy: {
    mn: 'Хамт суралцахыг урих',
    en: 'Invite to Study',
  },
  recommendedCourses: {
    mn: 'Санал болгох хичээлүүд',
    en: 'Recommended Courses',
  },
  createdBy: {
    mn: 'Бүтээсэн',
    en: 'Created by',
  },
  view: {
    mn: 'Харах',
    en: 'View',
  },
  moreComingSoon: {
    mn: 'Удахгүй илүү ихийг',
    en: 'More Coming Soon',
  },
  achievementsInProgress: {
    mn: 'Шинэ амжилтууд нэмэгдэж байна',
    en: 'New achievements are in the works',
  },
  thanksReceived: {
    mn: 'Хүлээн авсан талархалууд',
    en: 'Thanks Received',
  },
  thanksTeacherMessage: {
    mn: 'Багшийн тусламжтайгаар би математикийн шалгалтандаа A авлаа. Маш их баярлалаа!',
    en: 'Thanks to the teacher\'s help, I got an A on my math exam. Thank you so much!',
  },
  thanksStudentMessage: {
    mn: 'Сүүлийн асуултанд яаж хариулахаа мэдэхгүй байтал тусалсанд баярлалаа.',
    en: 'Thank you for helping me when I didn\'t know how to tackle the last question.',
  },
  questionTitle: {
    mn: 'Асуултын гарчиг',
    en: 'Question Title',
  },
  questionContent: {
    mn: 'Асуултын агуулга',
    en: 'Question Content',
  },
  selectGrade: {
    mn: 'Анги сонгох',
    en: 'Select Grade',
  },
  selectSubject: {
    mn: 'Хичээл сонгох',
    en: 'Select Subject',
  },
  uploadImage: {
    mn: 'Зураг оруулах',
    en: 'Upload Image',
  },
  questionTitlePlaceholder: {
    mn: 'Ойлгомжтой, тодорхой гарчиг оруулна уу',
    en: 'Enter a clear, specific title',
  },
  questionContentPlaceholder: {
    mn: 'Асуултаа дэлгэрэнгүй тайлбарлана уу...',
    en: 'Describe your question in detail...',
  },
  postQuestion: {
    mn: 'Асуулт нийтлэх',
    en: 'Post Question',
  },
  askQuestion: {
    mn: 'Асуулт асуух',
    en: 'Ask Question',
  },
  subject: {
    mn: 'Хичээл',
    en: 'Subject',
  },
  classLevel: {
    mn: 'Анги',
    en: 'Class Level',
  },
  questions: {
    mn: 'Асуултууд',
    en: 'Questions',
  },
  browsingQuestionsForGrade: {
    mn: 'Дараах ангийн асуултуудыг харж байна',
    en: 'Browsing questions for grade',
  },
  solved: {
    mn: 'Шийдэгдсэн',
    en: 'Solved',
  },
  noQuestionsFound: {
    mn: 'Асуултууд олдсонгүй',
    en: 'No Questions Found',
  },
  beFirstToAsk: {
    mn: 'Анхны асуулт асуух боломж танд байна!',
    en: 'Be the first to ask a question!',
  },
  testYourKnowledge: {
    mn: 'Мэдлэгээ шалгаж, шинэ зүйл суралцаарай',
    en: 'Test your knowledge and learn new things',
  },
  allQuizzes: {
    mn: 'Бүх тестүүд',
    en: 'All Quizzes',
  },
  recommended: {
    mn: 'Санал болгосон',
    en: 'Recommended',
  },
  completed: {
    mn: 'Дууссан',
    en: 'Completed',
  },
  minutes: {
    mn: 'минут',
    en: 'minutes',
  },
  startQuiz: {
    mn: 'Тест эхлүүлэх',
    en: 'Start Quiz',
  },
  loginRequired: {
    mn: 'Нэвтрэх шаардлагатай',
    en: 'Login Required',
  },
  loginToAccessQuizzes: {
    mn: 'Тестүүд дээр хандахын тулд нэвтэрч орно уу',
    en: 'Please log in to access quizzes',
  },
  noQuizzesFound: {
    mn: 'Тестүүд олдсонгүй',
    en: 'No Quizzes Found',
  },
  tryDifferentFilters: {
    mn: 'Өөр шүүлтүүр ашиглаж үзнэ үү',
    en: 'Try different filters',
  },
  resetSubject: {
    mn: 'Хичээл шүүлтүүр арилгах',
    en: 'Reset Subject Filter',
  },
  resetGrade: {
    mn: 'Анги шүүлтүүр арилгах',
    en: 'Reset Grade Filter',
  },
  average: {
    mn: 'Дундаж',
    en: 'Average',
  },
  favoriteSubject: {
    mn: 'Дуртай хичээл',
    en: 'Favorite Subject',
  },
  mathematics: {
    mn: 'Математик',
    en: 'Mathematics',
  },
  browseQuizzes: {
    mn: 'Тестүүд харах',
    en: 'Browse Quizzes',
  },
  participants: {
    mn: 'оролцогчид',
    en: 'participants',
  },
  tryNow: {
    mn: 'Одоо туршиж үзэх',
    en: 'Try Now',
  },
  quizNotFound: {
    mn: 'Тест олдсонгүй',
    en: 'Quiz Not Found',
  },
  quizNotFoundDescription: {
    mn: 'Таны хайж буй тест олдсонгүй эсвэл устгагдсан байна',
    en: 'The quiz you are looking for was not found or has been removed',
  },
  backToQuizzes: {
    mn: 'Тестүүд рүү буцах',
    en: 'Back to Quizzes',
  },
  timeLimit: {
    mn: 'Цагийн хязгаар',
    en: 'Time Limit',
  },
  passingScore: {
    mn: 'Тэнцэх оноо',
    en: 'Passing Score',
  },
  beforeYouStart: {
    mn: 'Эхлэхээс өмнө',
    en: 'Before You Start',
  },
  quizStartInfo1: {
    mn: 'Тест эхэлсний дараа цаг хэмжиж эхэлнэ',
    en: 'The timer will start as soon as you begin the quiz',
  },
  quizStartInfo2: {
    mn: 'Асуултуудад дараах дарааллаар хариулах шаардлагагүй',
    en: 'You can answer questions in any order',
  },
  quizStartInfo3: {
    mn: 'Тест дуусгах товчийг дарж хэдийд ч дуусгаж болно',
    en: 'You can submit your answers at any time by clicking the End Quiz button',
  },
  question: {
    mn: 'Асуулт',
    en: 'Question',
  },
  previous: {
    mn: 'Өмнөх',
    en: 'Previous',
  },
  next: {
    mn: 'Дараах',
    en: 'Next',
  },
  submitQuiz: {
    mn: 'Тест илгээх',
    en: 'Submit Quiz',
  },
  endQuiz: {
    mn: 'Тест дуусгах',
    en: 'End Quiz',
  },
  correct: {
    mn: 'Зөв',
    en: 'Correct',
  },
  incorrect: {
    mn: 'Буруу',
    en: 'Incorrect',
  },
  passed: {
    mn: 'Тэнцсэн',
    en: 'Passed',
  },
  notPassed: {
    mn: 'Тэнцээгүй',
    en: 'Not Passed',
  },
  quizPassedMessage: {
    mn: 'Баяр хүргэе! Та тестийг амжилттай дууслаа',
    en: 'Congratulations! You have successfully passed the quiz',
  },
  quizNotPassedMessage: {
    mn: 'Харамсалтай байна. Та дахин оролдож үзнэ үү',
    en: 'Sorry, you did not pass. Please try again',
  },
  reviewAnswers: {
    mn: 'Хариултуудыг шалгах',
    en: 'Review Answers',
  },
  retake: {
    mn: 'Дахин өгөх',
    en: 'Retake',
  },
  noCompletedQuizzes: {
    mn: 'Гүйцэтгэсэн тестүүд алга',
    en: 'No Completed Quizzes',
  },
  startQuizToTrack: {
    mn: 'Тест өгч амжилтуудаа хянаж эхлээрэй',
    en: 'Start taking quizzes to track your progress',
  },
  monthlyPerformance: {
    mn: 'Сарын гүйцэтгэл',
    en: 'Monthly Performance',
  },
};

// Function to get translation for a specific key
export const getTranslation = (lang: string, key: string): string => {
  if (!translations[key]) {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }
  
  if (lang === 'mn' && translations[key].mn) return translations[key].mn;
  if (lang === 'en' && translations[key].en) return translations[key].en;
  
  // Fallback to English if the language is not supported or translation is missing
  return translations[key].mn || key;
};

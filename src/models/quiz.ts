import { Timestamp } from 'firebase/firestore';

export enum QuizVisibility {
  Public = 'Нээлттэй',
  Private = 'Нууцлалттай',
  Class = 'Анги'
}

export interface Quiz {
  id: string; // Ensure id is a string
  title: string;
  description?: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
  questionCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  createdBy: string;
  createdById: string;
  tags: string[];
  visibility: QuizVisibility;
  photoURL?: string;
  popularity?: number;
  questions: QuizQuestion[];
  pointsPerQuestion: number;
  totalPoints: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  correctAnswer: string; // Added property
  explanation?: string;
  points?: number;
  imageURL?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface UserQuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: Date | string;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

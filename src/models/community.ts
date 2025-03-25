
import { User } from "./user";

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  subject: string;
  grade: string;
  tags?: string[];
  upvotes: number;
  views: number;
  answers: number;
  solved: boolean;
  acceptedAnswerId?: string;
}

export interface Answer {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  votes: number;
}

export interface CommunityUser extends User {
  stats?: {
    questions: number;
    answers: number;
    acceptedAnswers: number;
    reputation: number;
  };
}

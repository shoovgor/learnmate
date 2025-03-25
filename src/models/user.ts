
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role: UserRole;
  school?: string;
  schoolId?: string;
  grade?: string;
  points?: number;
  completedQuizzes?: number;
  createdAt: Date | string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date | string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'quiz' | 'friend' | 'achievement' | 'teacher';
  read: boolean;
  createdAt: Date | string;
  link?: string;
  relatedId?: string;
}


export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  createdAt: Date | string;
}

export interface ClassStudent {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  grade?: string;
  points?: number;
  completedQuizzes?: number;
}

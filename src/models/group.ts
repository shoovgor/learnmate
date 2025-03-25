
import { User } from './user';

export interface Group {
  id: string;
  name: string;
  description: string;
  schoolId?: string;
  school?: string;
  subject?: string;
  grade?: string;
  teacherId?: string;
  teacherName?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  members: string[];
  admins: string[];
  isPublic: boolean;
  photoURL?: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: Date | string;
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name?: string;
  }[];
  createdAt: Date | string;
  updatedAt?: Date | string;
  likes: string[];
  comments: GroupComment[];
}

export interface GroupComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  likes: string[];
}

export interface GroupResource {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  type: 'pdf' | 'document' | 'image' | 'video' | 'link' | 'other';
  url: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: Date | string;
  size?: number; // in bytes
  downloads?: number;
}

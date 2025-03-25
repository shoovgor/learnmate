import { db } from '@/config/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
  increment,
  runTransaction,
  QueryConstraint
} from 'firebase/firestore';
import { Quiz, UserQuizResult, QuizVisibility } from '@/models/quiz'; // Updated import
import { ClassStudent } from '@/models/class'; // Updated import

// Create a new quiz
export const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
  try {
    const quizRef = await addDoc(collection(db, 'quizzes'), {
      ...quizData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      popularity: 0,
      visibility: quizData.visibility || 'private',
      questions: quizData.questions.map(question => ({
        ...question,
        correctAnswer: question.correctAnswer // Ensure correctAnswer is included
      }))
    });
    
    return quizRef.id; // Return the quiz ID
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

// Get a quiz by ID
export const getQuiz = async (quizId: string): Promise<Quiz> => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      throw new Error('Quiz not found');
    }

    const quizData = quizSnap.data();

    // Convert timestamps to ISO strings
    const createdAt = quizData.createdAt instanceof Timestamp 
      ? quizData.createdAt.toDate().toISOString() 
      : quizData.createdAt;

    const updatedAt = quizData.updatedAt instanceof Timestamp 
      ? quizData.updatedAt.toDate().toISOString() 
      : quizData.updatedAt;

    return {
      id: quizSnap.id,
      ...quizData,
      createdAt,
      updatedAt
    } as Quiz;
  } catch (error) {
    console.error('Error getting quiz:', error);
    throw error;
  }
};

// Update a quiz
export const updateQuiz = async (quizId: string, updates: Partial<Quiz>) => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    
    // Exclude id from updates
    const { id, ...validUpdates } = updates;
    
    await updateDoc(quizRef, {
      ...validUpdates,
      updatedAt: Timestamp.now(),
      questions: validUpdates.questions?.map(question => ({
        ...question,
        correctAnswer: question.correctAnswer // Ensure correctAnswer is included
      }))
    });
    
    return {
      id: quizId,
      ...updates
    };
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId: string) => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    await deleteDoc(quizRef);
    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
};

// Fetch quizzes with optional filters
export const fetchQuizzes = async (filters?: {
  subject?: string;
  grade?: string;
  authorId?: string;
  search?: string;
  visibility?: QuizVisibility;
  limit?: number;
}): Promise<Quiz[]> => {
  try {
    let queryConstraints: QueryConstraint[] = [];
    
    if (filters?.subject) {
      queryConstraints.push(where('subject', '==', filters.subject));
    }
    
    if (filters?.grade) {
      queryConstraints.push(where('grade', '==', filters.grade));
    }
    
    if (filters?.authorId) {
      queryConstraints.push(where('authorId', '==', filters.authorId));
    }
    
    if (filters?.visibility) {
      queryConstraints.push(where('visibility', '==', filters.visibility));
    }
    
    // Order by createdAt (newest first)
    queryConstraints.push(orderBy('createdAt', 'desc'));
    
    if (filters?.limit) {
      queryConstraints.push(limit(filters.limit));
    }
    
    const quizzesQuery = query(collection(db, 'quizzes'), ...queryConstraints);
    const querySnapshot = await getDocs(quizzesQuery);
    
    let quizzes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert timestamps to ISO strings
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : data.createdAt;
        
      const updatedAt = data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : data.updatedAt;
      
      return {
        id: doc.id,
        ...data as Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>,
        createdAt,
        updatedAt
      } as Quiz;
    });
    
    // If search term is provided, filter quizzes that include the term in title or description
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      quizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchLower) ||
        (quiz.description && quiz.description.toLowerCase().includes(searchLower))
      );
    }
    
    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

// Get public quizzes for homepage
export const fetchPublicQuizzes = async (limit = 6): Promise<Quiz[]> => {
  return fetchQuizzes({ 
    visibility: QuizVisibility.Public, // Corrected enum value
    limit
  });
};

// Submit a quiz result and update user statistics
export const submitQuizResult = async (
  userId: string | null,
  quizId: string,
  answers: Record<string, string>,
  timeSpent: number
) => {
  try {
    // Get the quiz
    const quiz = await getQuiz(quizId);
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correctOptionId) { // Ensure correct comparison
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const earnedPoints = Math.round((correctAnswers / quiz.questions.length) * quiz.totalPoints);
    
    // For anonymous users, just return the score without saving
    if (!userId) {
      return {
        score,
        earnedPoints,
        correctAnswers,
        totalQuestions: quiz.questions.length
      };
    }
    
    // Create result document
    const resultRef = await addDoc(collection(db, 'quiz_results'), {
      userId,
      quizId,
      quizTitle: quiz.title,
      score,
      totalPoints: quiz.totalPoints,
      earnedPoints,
      completedAt: Timestamp.now(),
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeSpent,
      answers
    });
    
    // Only update user stats for non-public quizzes
    if (quiz.visibility !== QuizVisibility.Public) {
      // Update user stats (points and completed quizzes)
      const userRef = doc(db, 'users', userId);
      
      // Use transaction to ensure data consistency
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User does not exist');
        }
        
        // Update user points and completed quizzes
        transaction.update(userRef, {
          points: increment(earnedPoints),
          completedQuizzes: increment(1)
        });
        
        // Update quiz popularity
        const quizRef = doc(db, 'quizzes', quizId);
        transaction.update(quizRef, {
          popularity: increment(1)
        });
      });
      
      // Update local storage with new points
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedPoints = (userData.points || 0) + earnedPoints;
        const updatedCompletedQuizzes = (userData.completedQuizzes || 0) + 1;
        
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          points: updatedPoints,
          completedQuizzes: updatedCompletedQuizzes
        }));
      } catch (e) {
        console.error('Error updating local storage:', e);
      }
    } else {
      // For public quizzes, just update the quiz popularity
      const quizRef = doc(db, 'quizzes', quizId);
      await updateDoc(quizRef, {
        popularity: increment(1)
      });
    }
    
    return {
      id: resultRef.id,
      score,
      earnedPoints,
      correctAnswers,
      totalQuestions: quiz.questions.length
    };
  } catch (error) {
    console.error('Error submitting quiz result:', error);
    throw error;
  }
};

// Get user's quiz results
export const getUserQuizResults = async (userId: string): Promise<UserQuizResult[]> => {
  try {
    const resultsQuery = query(
      collection(db, 'quiz_results'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(resultsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert timestamp to ISO string
      const completedAt = data.completedAt instanceof Timestamp 
        ? data.completedAt.toDate().toISOString() 
        : data.completedAt;
      
      return {
        id: doc.id,
        ...data,
        completedAt
      } as UserQuizResult;
    });
  } catch (error) {
    console.error('Error getting user quiz results:', error);
    throw error;
  }
};

// Get user attempts and stats for profile
export const fetchUserAttempts = async (userId: string): Promise<UserQuizResult[]> => {
  return getUserQuizResults(userId);
};

// Get user statistics
export const fetchUserStats = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    
    const resultsQuery = query(
      collection(db, 'quiz_results'),
      where('userId', '==', userId)
    );
    
    const resultsSnap = await getDocs(resultsQuery);
    const quizResults = resultsSnap.docs.map(doc => doc.data());
    
    const totalAttempts = quizResults.length;
    const totalCorrect = quizResults.reduce((sum, result) => sum + (result.correctAnswers || 0), 0);
    const totalQuestions = quizResults.reduce((sum, result) => sum + (result.totalQuestions || 0), 0);
    const averageScore = totalAttempts > 0 
      ? quizResults.reduce((sum, result) => sum + (result.score || 0), 0) / totalAttempts 
      : 0;
    
    return {
      points: userData.points || 0,
      completedQuizzes: userData.completedQuizzes || 0,
      totalAttempts,
      averageScore: Math.round(averageScore),
      correctRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Get top users for rankings
export const fetchTopUsers = async (filters?: { 
  grade?: string, 
  schoolId?: string,
  limit?: number 
}) => {
  try {
    const queryConstraints: QueryConstraint[] = [
      where('role', '==', 'student'),
      orderBy('points', 'desc')
    ];

    if (filters?.grade) {
      queryConstraints.push(where('grade', '==', filters.grade));
    }

    if (filters?.schoolId) {
      queryConstraints.push(where('schoolId', '==', filters.schoolId));
    }
    
    // Create the query without the limit first
    const usersQuery = query(collection(db, 'users'), ...queryConstraints);
    
    // Add limit as a separate query
    const limitedQuery = filters?.limit 
      ? query(usersQuery, limit(filters.limit || 50))
      : query(usersQuery, limit(50)); // Default limit
    
    const querySnapshot = await getDocs(limitedQuery);
    
    let rank = 1;
    const topUsers = querySnapshot.docs.map((doc, index) => {
      const userData = doc.data();
      
      // Assign the same rank for users with the same number of points
      if (index > 0) {
        const prevUser = querySnapshot.docs[index - 1].data();
        if (userData.points !== prevUser.points) {
          rank = index + 1;
        }
      }
      
      return {
        id: doc.id,
        rank,
        ...userData
      };
    });
    
    return topUsers;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
};

// Search students for teacher to add to class
export const searchStudents = async (params: {
  query: string,
  school?: string,
  grade?: string,
  limit?: number
}): Promise<ClassStudent[]> => {
  try {
    // We'll search in users collection for students
    const queryConstraints: QueryConstraint[] = [
      where('role', '==', 'student')
    ];
    
    if (params.school) {
      queryConstraints.push(where('school', '==', params.school));
    }
    
    if (params.grade) {
      queryConstraints.push(where('grade', '==', params.grade));
    }
    
    // Add limit
    if (params.limit) {
      queryConstraints.push(limit(params.limit));
    } else {
      queryConstraints.push(limit(20)); // Default limit
    }
    
    const studentsQuery = query(collection(db, 'users'), ...queryConstraints);
    const querySnapshot = await getDocs(studentsQuery);
    
    // Filter results by name match (client-side filtering since Firestore doesn't support partial text search)
    const searchTermLower = params.query.toLowerCase();
    
    const matchingStudents = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          userId: doc.id,
          displayName: data.displayName || '',
          email: data.email || '',
          photoURL: data.photoURL,
          grade: data.grade,
          points: data.points || 0,
          completedQuizzes: data.completedQuizzes || 0
        };
      })
      .filter(student => 
        student.displayName.toLowerCase().includes(searchTermLower) || 
        student.email.toLowerCase().includes(searchTermLower)
      );
    
    return matchingStudents;
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
};

// Add students to a teacher's class
export const addStudentsToClass = async (teacherId: string, studentIds: string[]) => {
  try {
    const teacherRef = doc(db, 'users', teacherId);
    const teacherSnap = await getDoc(teacherRef);
    
    if (!teacherSnap.exists()) {
      throw new Error('Teacher not found');
    }
    
    // Create or update the teacher's class collection
    const classRef = doc(db, 'classes', teacherId);
    const classSnap = await getDoc(classRef);
    
    if (classSnap.exists()) {
      // Update existing class
      await updateDoc(classRef, {
        students: [...new Set([...classSnap.data().students, ...studentIds])]
      });
    } else {
      // Create new class
      await addDoc(collection(db, 'classes'), {
        teacherId,
        students: studentIds,
        createdAt: Timestamp.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding students to class:', error);
    throw error;
  }
};

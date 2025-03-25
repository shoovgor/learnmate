import { db, auth } from '@/config/firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  increment,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { Question, Answer } from '@/models/community';

// Create new question
export const createQuestion = async (questionData: Omit<Question, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const questionsRef = collection(db, 'questions');
    
    const newQuestion = {
      ...questionData,
      createdAt: serverTimestamp(),
      upvotes: 0,
      views: 0,
      answers: 0,
      solved: false,
    };
    
    const docRef = await addDoc(questionsRef, newQuestion);
    return docRef.id;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Get questions with optional filters
export const getQuestions = async (filters: any = {}) => {
  try {
    let q = collection(db, 'questions');
    let queryConstraints: any[] = [orderBy('createdAt', 'desc')];
    
    if (filters.grade) {
      queryConstraints.push(where('grade', '==', filters.grade));
    }
    
    if (filters.subject) {
      queryConstraints.push(where('subject', '==', filters.subject));
    }
    
    if (filters.authorId) {
      queryConstraints.push(where('authorId', '==', filters.authorId));
    }
    
    const questionsQuery = query(q, ...queryConstraints);
    const snapshot = await getDocs(questionsQuery);
    
    const questions: Question[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Question);
    });
    
    // Filter by search term locally (as Firestore can't do full-text search easily)
    let filteredQuestions = questions;
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      filteredQuestions = questions.filter(q => 
        q.title.toLowerCase().includes(searchTermLower) || 
        q.content.toLowerCase().includes(searchTermLower)
      );
    }
    
    return { 
      questions: filteredQuestions,
      lastDocument: snapshot.docs[snapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

// Get a single question by ID
export const getQuestionById = async (questionId: string): Promise<Question | null> => {
  try {
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (!questionSnap.exists()) {
      return null;
    }
    
    const questionData = questionSnap.data();
    
    // Increment view count
    await updateDoc(questionRef, {
      views: increment(1)
    });
    
    return {
      id: questionSnap.id,
      ...questionData,
      createdAt: questionData.createdAt?.toDate() || new Date(),
    } as Question;
  } catch (error) {
    console.error('Error getting question by ID:', error);
    throw error;
  }
};

// Update a question
export const updateQuestion = async (questionId: string, updates: Partial<Question>): Promise<void> => {
  try {
    const questionRef = doc(db, 'questions', questionId);
    
    await updateDoc(questionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (questionId: string): Promise<void> => {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Create an answer
export const createAnswer = async (questionId: string, answerData: Omit<Answer, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const answersCollection = collection(db, 'questions', questionId, 'answers');
    
    const newAnswer = {
      ...answerData,
      createdAt: serverTimestamp(),
      votes: 0
    };
    
    const docRef = await addDoc(answersCollection, newAnswer);
    
    // Update answers count on question
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      answers: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

// Get answers for a question
export const getAnswers = async (questionId: string): Promise<Answer[]> => {
  try {
    const answersCollection = collection(db, 'questions', questionId, 'answers');
    const q = query(answersCollection, orderBy('votes', 'desc'));
    const snapshot = await getDocs(q);
    
    const answers: Answer[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      answers.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Answer);
    });
    
    return answers;
  } catch (error) {
    console.error('Error getting answers:', error);
    throw error;
  }
};

// Update an answer
export const updateAnswer = async (questionId: string, answerId: string, updates: Partial<Answer>): Promise<void> => {
  try {
    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    
    await updateDoc(answerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
};

// Delete an answer
export const removeAnswer = async (questionId: string, answerId: string): Promise<void> => {
  try {
    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    await deleteDoc(answerRef);
    
    // Update answers count on question
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      answers: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
};

// Vote on an answer
export const updateAnswerVote = async (questionId: string, answerId: string, userId: string, isUpvote: boolean): Promise<void> => {
  try {
    const answerRef = doc(db, 'questions', questionId, 'answers', answerId);
    const answerVotesRef = doc(db, 'questions', questionId, 'answers', answerId, 'votes', userId);
    const answerVotesDoc = await getDoc(answerVotesRef);
    
    const voteValue = isUpvote ? 1 : -1;
    
    if (answerVotesDoc.exists()) {
      const currentVote = answerVotesDoc.data().value;
      
      if (currentVote === voteValue) {
        // User is removing their vote
        await deleteDoc(answerVotesRef);
        await updateDoc(answerRef, {
          votes: increment(-currentVote)
        });
      } else {
        // User is toggling their vote
        await updateDoc(answerVotesRef, {
          value: voteValue
        });
        await updateDoc(answerRef, {
          votes: increment(voteValue * 2) // Double because we're flipping from +1 to -1 or vice versa
        });
      }
    } else {
      // User is voting for the first time
      await setDoc(answerVotesRef, {
        value: voteValue,
        timestamp: serverTimestamp()
      });
      await updateDoc(answerRef, {
        votes: increment(voteValue)
      });
    }
  } catch (error) {
    console.error('Error updating answer vote:', error);
    throw error;
  }
};

// Mark question as solved
export const updateQuestionStatus = async (questionId: string, isSolved: boolean, acceptedAnswerId?: string): Promise<void> => {
  try {
    const questionRef = doc(db, 'questions', questionId);
    const updateData: any = {
      solved: isSolved
    };
    
    if (acceptedAnswerId) {
      updateData.acceptedAnswerId = acceptedAnswerId;
    }
    
    await updateDoc(questionRef, updateData);
  } catch (error) {
    console.error('Error marking question as solved:', error);
    throw error;
  }
};

// Search questions (basic implementation - for more advanced search consider Algolia or similar)
export const searchQuestions = async (searchTerm: string): Promise<Question[]> => {
  try {
    const { questions } = await getQuestions();
    
    const searchTermLower = searchTerm.toLowerCase();
    return questions.filter(q => 
      q.title.toLowerCase().includes(searchTermLower) || 
      q.content.toLowerCase().includes(searchTermLower) ||
      (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
    );
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
};

// Remove a question
export const removeQuestion = async (questionId: string): Promise<void> => {
  try {
    const questionRef = doc(db, 'questions', questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Error removing question:', error);
    throw error;
  }
};

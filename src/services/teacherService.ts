
import { db } from '@/config/firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  increment,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';

// Function to get teacher analytics
export const getTeacherAnalytics = async (teacherId: string) => {
  try {
    // Get quizzes created by teacher
    const quizQuery = query(
      collection(db, 'quizzes'),
      where('createdById', '==', teacherId)
    );
    const quizSnapshot = await getDocs(quizQuery);
    
    // Get quiz attempts for teacher's quizzes
    let totalAttempts = 0;
    let completedAttempts = 0;
    let avgScore = 0;
    let totalScore = 0;
    
    const quizIds = quizSnapshot.docs.map(doc => doc.id);
    
    for (const quizId of quizIds) {
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('quizId', '==', quizId)
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      totalAttempts += attemptsSnapshot.size;
      
      attemptsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.completed) {
          completedAttempts++;
          totalScore += data.score || 0;
        }
      });
    }
    
    avgScore = completedAttempts > 0 ? totalScore / completedAttempts : 0;
    
    // Get students in teacher's classes
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId)
    );
    const classesSnapshot = await getDocs(classesQuery);
    
    let totalStudents = 0;
    
    classesSnapshot.forEach(doc => {
      const data = doc.data();
      totalStudents += (data.students?.length || 0);
    });
    
    return {
      totalQuizzes: quizSnapshot.size,
      totalAttempts,
      completedAttempts,
      avgScore,
      totalStudents,
      totalClasses: classesSnapshot.size
    };
  } catch (error) {
    console.error('Error getting teacher analytics:', error);
    throw error;
  }
};

// Function to get teacher's students
export const getTeacherStudents = async (teacherId: string) => {
  try {
    // Get classes taught by this teacher
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId)
    );
    const classesSnapshot = await getDocs(classesQuery);
    
    const studentIds = new Set<string>();
    const classData: any[] = [];
    
    // Collect all student IDs and class info
    classesSnapshot.forEach(doc => {
      const data = doc.data();
      classData.push({
        id: doc.id,
        name: data.name,
        grade: data.grade,
        subject: data.subject,
        students: data.students || []
      });
      
      if (data.students && Array.isArray(data.students)) {
        data.students.forEach((studentId: string) => {
          studentIds.add(studentId);
        });
      }
    });
    
    // Get student details
    const students: any[] = [];
    
    for (const studentId of studentIds) {
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        students.push({
          id: studentId,
          name: studentData.displayName,
          email: studentData.email,
          photoURL: studentData.photoURL,
          grade: studentData.grade,
          school: studentData.school,
          classes: classData.filter(c => c.students.includes(studentId)).map(c => c.name)
        });
      }
    }
    
    return { students, classes: classData };
  } catch (error) {
    console.error('Error getting teacher students:', error);
    throw error;
  }
};

// Function to get teacher's quizzes with stats
export const getTeacherQuizzesWithStats = async (teacherId: string) => {
  try {
    const quizQuery = query(
      collection(db, 'quizzes'),
      where('createdById', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const quizSnapshot = await getDocs(quizQuery);
    
    const quizzes: any[] = [];
    
    for (const quizDoc of quizSnapshot.docs) {
      const quizData = quizDoc.data();
      
      // Get attempts for this quiz
      const attemptsQuery = query(
        collection(db, 'quizAttempts'),
        where('quizId', '==', quizDoc.id)
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      let totalScore = 0;
      let completedCount = 0;
      
      attemptsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.completed) {
          completedCount++;
          totalScore += data.score || 0;
        }
      });
      
      const avgScore = completedCount > 0 ? totalScore / completedCount : 0;
      
      quizzes.push({
        id: quizDoc.id,
        title: quizData.title,
        subject: quizData.subject,
        grade: quizData.grade,
        questionCount: quizData.questionCount,
        createdAt: quizData.createdAt?.toDate() || new Date(),
        attempts: attemptsSnapshot.size,
        completedAttempts: completedCount,
        avgScore,
        popularity: quizData.popularity || 0
      });
    }
    
    return quizzes;
  } catch (error) {
    console.error('Error getting teacher quizzes with stats:', error);
    throw error;
  }
};

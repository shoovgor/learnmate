
import { db } from '@/config/firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { Class, ClassStudent } from '@/models/class';
import { User } from '@/models/user';

// Create a new class
export const createClass = async (className: string): Promise<string> => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const teacherId = userData.uid;
    
    if (!teacherId) {
      throw new Error('User not authenticated');
    }
    
    const classRef = await addDoc(collection(db, 'classes'), {
      name: className,
      teacherId,
      studentIds: [],
      createdAt: serverTimestamp()
    });
    
    return classRef.id;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

// Get all classes for a teacher
export const getClasses = async (): Promise<Class[]> => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const teacherId = userData.uid;
    
    if (!teacherId) {
      throw new Error('User not authenticated');
    }
    
    const classesQuery = query(
      collection(db, 'classes'),
      where('teacherId', '==', teacherId)
    );
    
    const querySnapshot = await getDocs(classesQuery);
    const classes: Class[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const classData = docSnapshot.data();
      classes.push({
        id: docSnapshot.id,
        name: classData.name,
        teacherId: classData.teacherId,
        studentIds: classData.studentIds || [],
        createdAt: classData.createdAt?.toDate?.() || new Date().toISOString()
      });
    });
    
    return classes;
  } catch (error) {
    console.error('Error getting classes:', error);
    throw error;
  }
};

// Get all students (filtering out teachers and admins)
export const getStudents = async (): Promise<User[]> => {
  try {
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    
    const querySnapshot = await getDocs(studentsQuery);
    const students: User[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const studentData = docSnapshot.data();
      students.push({
        uid: docSnapshot.id,
        email: studentData.email,
        displayName: studentData.displayName,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        photoURL: studentData.photoURL,
        role: studentData.role,
        school: studentData.school,
        schoolId: studentData.schoolId,
        grade: studentData.grade,
        points: studentData.points,
        completedQuizzes: studentData.completedQuizzes,
        createdAt: studentData.createdAt?.toDate?.() || new Date().toISOString()
      });
    });
    
    return students;
  } catch (error) {
    console.error('Error getting students:', error);
    throw error;
  }
};

// Get students in a specific class
export const getStudentsInClass = async (classId: string): Promise<User[]> => {
  try {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    
    if (!classSnap.exists()) {
      throw new Error('Class not found');
    }
    
    const classData = classSnap.data();
    const studentIds = classData.studentIds || [];
    
    if (studentIds.length === 0) {
      return [];
    }
    
    const students: User[] = [];
    
    for (const studentId of studentIds) {
      const studentRef = doc(db, 'users', studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        students.push({
          uid: studentSnap.id,
          email: studentData.email,
          displayName: studentData.displayName,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          photoURL: studentData.photoURL,
          role: studentData.role,
          school: studentData.school,
          schoolId: studentData.schoolId,
          grade: studentData.grade,
          points: studentData.points,
          completedQuizzes: studentData.completedQuizzes,
          createdAt: studentData.createdAt?.toDate?.() || new Date().toISOString()
        });
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error getting students in class:', error);
    throw error;
  }
};

// Add students to a class
export const addStudentsToClass = async (classId: string, studentIds: string[]): Promise<void> => {
  try {
    const classRef = doc(db, 'classes', classId);
    
    // Add each student ID to the class
    for (const studentId of studentIds) {
      await updateDoc(classRef, {
        studentIds: arrayUnion(studentId)
      });
    }
  } catch (error) {
    console.error('Error adding students to class:', error);
    throw error;
  }
};

// Remove a student from a class
export const removeStudentFromClass = async (classId: string, studentId: string): Promise<void> => {
  try {
    const classRef = doc(db, 'classes', classId);
    
    await updateDoc(classRef, {
      studentIds: arrayRemove(studentId)
    });
  } catch (error) {
    console.error('Error removing student from class:', error);
    throw error;
  }
};

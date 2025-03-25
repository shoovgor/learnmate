import { auth, db } from '@/config/firebaseConfig';
import { User, UserRole } from '@/models/user';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

// Check if a user exists in the Firestore
export const checkUserExists = async (userId: string): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
};

// Get a user's role
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return 'student'; // Default role
    }
    
    const userData = userSnap.data();
    return userData.role || 'student';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'student'; // Default role on error
  }
};

// Sign up a new user
export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  schoolId: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Set display name
  const displayName = `${firstName} ${lastName}`;
  await firebaseUpdateProfile(user, { displayName });
  
  // Get school info
  const schoolRef = doc(db, 'schools', schoolId);
  const schoolSnap = await getDoc(schoolRef);
  const schoolData = schoolSnap.exists() ? schoolSnap.data() : { name: 'Unknown School' };
  
  // Create user in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    firstName,
    lastName,
    role: 'student', // Default role
    schoolId,
    school: schoolData.name,
    points: 0,
    completedQuizzes: 0,
    createdAt: Timestamp.now()
  });
  
  // Update local storage
  localStorage.setItem('userData', JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName,
    firstName,
    lastName,
    role: 'student',
    schoolId,
    school: schoolData.name
  }));
  
  return userCredential;
};

// Sign in an existing user
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Get user role
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    
    // Update local storage with user data
    localStorage.setItem('userData', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: userData.role || 'student',
      firstName: userData.firstName,
      lastName: userData.lastName,
      schoolId: userData.schoolId,
      school: userData.school,
      photoURL: userData.photoURL,
      points: userData.points || 0,
      completedQuizzes: userData.completedQuizzes || 0
    }));
  } else {
    // User exists in Auth but not in Firestore, create a basic record
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'student',
      points: 0,
      completedQuizzes: 0,
      createdAt: Timestamp.now()
    });
    
    // Update local storage with basic user data
    localStorage.setItem('userData', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'student'
    }));
  }
  
  return userCredential;
};

// Sign out
export const logOut = async (): Promise<void> => {
  await signOut(auth);
  localStorage.removeItem('userData');
  localStorage.removeItem('isLoggedIn');
};

// Get user data
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const userData = userSnap.data();
    const createdAt = userData.createdAt instanceof Timestamp 
      ? userData.createdAt.toDate().toISOString() 
      : userData.createdAt;
    
    return {
      ...userData,
      createdAt
    } as User;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    
    // Update local storage
    const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    localStorage.setItem('userData', JSON.stringify({
      ...storedUserData,
      ...data
    }));
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get teachers
export const getTeachers = async (searchQuery?: string) => {
  try {
    const teachersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      orderBy('displayName')
    );
    
    const querySnapshot = await getDocs(teachersQuery);
    
    let teachers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName || '',
        email: data.email || '',
        ...data
      };
    });
    
    // Filter by search query if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      teachers = teachers.filter(teacher => 
        teacher.displayName.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower)
      );
    }
    
    return teachers;
  } catch (error) {
    console.error('Error getting teachers:', error);
    throw error;
  }
};

// Promote user to teacher
export const promoteToTeacher = async (email: string): Promise<void> => {
  try {
    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email),
      limit(1)
    );
    const userSnapshot = await getDocs(usersQuery);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await updateDoc(userDoc.ref, { role: 'teacher' });
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error promoting user to teacher:', error);
    throw error;
  }
};

// Demote teacher to student
export const demoteTeacher = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: 'student' });
  } catch (error) {
    console.error('Error demoting teacher:', error);
    throw error;
  }
};

// Get students by school and grade
export const getStudentsBySchoolAndGrade = async (
  schoolId: string,
  grade?: string
) => {
  try {
    let studentsQuery;
    
    if (grade) {
      studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('grade', '==', grade),
        where('role', '==', 'student'),
        orderBy('displayName')
      );
    } else {
      studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'student'),
        orderBy('displayName')
      );
    }
    
    const querySnapshot = await getDocs(studentsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as object)
    }));
  } catch (error) {
    console.error('Error getting students:', error);
    throw error;
  }
};

// Initialize admin user (to be called once during app setup)
export const initializeAdmin = async (adminEmail: string): Promise<void> => {
  try {
    // Check if admin already exists
    const adminsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'admin'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(adminsQuery);
    
    if (querySnapshot.empty) {
      // Find user with admin email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', adminEmail),
        limit(1)
      );
      
      const userSnapshot = await getDocs(usersQuery);
      
      if (!userSnapshot.empty) {
        // Make this user an admin
        const adminUser = userSnapshot.docs[0];
        await updateDoc(adminUser.ref, { role: 'admin' });
        console.log(`User ${adminEmail} promoted to admin`);
      } else {
        console.warn(`No user found with email ${adminEmail}`);
      }
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

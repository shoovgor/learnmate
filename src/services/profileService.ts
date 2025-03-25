
import { db } from '@/config/firebaseConfig';
import { 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc, 
  addDoc, 
  deleteDoc,
  collection,
  query,
  where,
  Timestamp,
  increment,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { Friend } from '@/models/user';

// Send friend request
export const sendFriendRequest = async (userId: string, friendId: string): Promise<Friend> => {
  try {
    // Check if a request already exists
    const existingRequestQuery = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('friendId', '==', friendId)
    );
    
    const existingFriendQuery = query(
      collection(db, 'friends'),
      where('userId', '==', friendId),
      where('friendId', '==', userId)
    );
    
    const [existingRequestSnapshot, existingFriendSnapshot] = await Promise.all([
      getDocs(existingRequestQuery),
      getDocs(existingFriendQuery)
    ]);
    
    if (!existingRequestSnapshot.empty || !existingFriendSnapshot.empty) {
      throw new Error('Friend request already exists or you are already friends');
    }
    
    // Create the friend request
    const friendRequest = {
      userId,
      friendId,
      status: 'pending',
      createdAt: Timestamp.now()
    };
    
    const requestRef = await addDoc(collection(db, 'friends'), friendRequest);
    
    return {
      id: requestRef.id,
      ...friendRequest,
      createdAt: friendRequest.createdAt.toDate().toISOString()
    } as Friend;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId: string): Promise<Friend> => {
  try {
    const requestRef = doc(db, 'friends', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      throw new Error('Friend request not found');
    }
    
    const request = requestSnap.data() as Friend;
    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }
    
    await updateDoc(requestRef, { status: 'accepted' });
    
    return {
      id: requestId,
      ...request,
      status: 'accepted'
    } as Friend;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Reject friend request
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friends', requestId);
    await updateDoc(requestRef, { status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

// Delete friend
export const deleteFriend = async (requestId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'friends', requestId);
    await deleteDoc(requestRef);
  } catch (error) {
    console.error('Error deleting friend:', error);
    throw error;
  }
};

// Get a user's friends
export const getUserFriends = async (userId: string) => {
  try {
    // Get friend connections where user is the requester and status is accepted
    const sentQuery = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    // Get friend connections where user is the recipient and status is accepted
    const receivedQuery = query(
      collection(db, 'friends'),
      where('friendId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    const friendIds = new Set<string>();
    const friendConnections: Record<string, any> = {};
    
    // Process sent friend requests
    sentSnapshot.forEach(doc => {
      const data = doc.data();
      friendIds.add(data.friendId);
      friendConnections[data.friendId] = {
        connectionId: doc.id,
        ...data
      };
    });
    
    // Process received friend requests
    receivedSnapshot.forEach(doc => {
      const data = doc.data();
      friendIds.add(data.userId);
      friendConnections[data.userId] = {
        connectionId: doc.id,
        ...data
      };
    });
    
    // Get user details for each friend
    const friendsData: any[] = [];
    
    for (const friendId of friendIds) {
      const userRef = doc(db, 'users', friendId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        friendsData.push({
          ...userData,
          id: friendId,
          connectionId: friendConnections[friendId].connectionId
        });
      }
    }
    
    return friendsData;
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
};

// Get pending friend requests (received)
export const getPendingFriendRequests = async (userId: string) => {
  try {
    const pendingQuery = query(
      collection(db, 'friends'),
      where('friendId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    const requests: any[] = [];
    
    for (const doc of pendingSnapshot.docs) {
      const data = doc.data();
      const userRef = await getDoc(doc.data().userId);
      
      if (userRef.exists()) {
        const userData = userRef.data() as { id: string; displayName: string; photoURL: string };
        requests.push({
            id: doc.id,
            ...data,
            sender: {
                id: userData.id,
                displayName: userData.displayName,
                photoURL: userData.photoURL
            }
        });
      }
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting pending friend requests:', error);
    throw error;
  }
};

// Find students by school and grade
export const findStudentsBySchoolAndGrade = async (schoolId: string, grade?: string) => {
  try {
    let studentsQuery;
    
    if (grade) {
      studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('grade', '==', grade),
        where('role', '==', 'student')
      );
    } else {
      studentsQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('role', '==', 'student')
      );
    }
    
    const querySnapshot = await getDocs(studentsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, unknown>)
    }));
  } catch (error) {
    console.error('Error finding students:', error);
    throw error;
  }
};

// Add points to user's profile
export const addPointsToUser = async (userId: string, points: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      points: increment(points)
    });
    
    // Update local storage
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.uid === userId) {
        const newPoints = (userData.points || 0) + points;
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          points: newPoints
        }));
      }
    } catch (e) {
      console.error('Error updating points in local storage:', e);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding points to user:', error);
    throw error;
  }
};

// Get available classmates (students from same school and grade)
export const getAvailableClassmates = async (userId: string) => {
  try {
    // Get user data to find school and grade
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    const { schoolId, grade } = userData;
    
    if (!schoolId || !grade) {
      return [];
    }
    
    // Find classmates
    const classmatesQuery = query(
      collection(db, 'users'),
      where('schoolId', '==', schoolId),
      where('grade', '==', grade),
      where('role', '==', 'student')
    );
    
    const classmatesSnapshot = await getDocs(classmatesQuery);
    
    // Get existing friend connections
    const sentQuery = query(
      collection(db, 'friends'),
      where('userId', '==', userId)
    );
    
    const receivedQuery = query(
      collection(db, 'friends'),
      where('friendId', '==', userId)
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    // Create sets of connected user IDs
    const connectedUserIds = new Set<string>();
    
    sentSnapshot.forEach(doc => {
      connectedUserIds.add(doc.data().friendId);
    });
    
    receivedSnapshot.forEach(doc => {
      connectedUserIds.add(doc.data().userId);
    });
    
    // Filter out current user and already connected users
    const availableClassmates = classmatesSnapshot.docs
      .filter(doc => doc.id !== userId && !connectedUserIds.has(doc.id))
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    
    return availableClassmates;
  } catch (error) {
    console.error('Error getting available classmates:', error);
    throw error;
  }
};

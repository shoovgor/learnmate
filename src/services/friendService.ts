
import { db, auth } from '@/config/firebaseConfig';
import { Friend } from '@/models/user';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Get friends for a user (accepted only)
export const getFriends = async (userId: string) => {
  try {
    // Get friends where user is the requester
    const sentQuery = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    // Get friends where user is the recipient
    const receivedQuery = query(
      collection(db, 'friends'),
      where('friendId', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const sentSnapshot = await getDocs(sentQuery);
    const receivedSnapshot = await getDocs(receivedQuery);
    
    const sentFriends = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toDate().toISOString() 
        : doc.data().createdAt
    }));
    
    const receivedFriends = receivedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toDate().toISOString() 
        : doc.data().createdAt
    }));
    
    // Combine and fetch full user details
    const friendIds = [
      ...sentFriends.map(f => f.friendId as string),
      ...receivedFriends.map(f => f.userId as string)
    ];
    
    const friendUsers = [];
    
    for (const friendId of friendIds) {
      const userDoc = await getDoc(doc(db, 'users', friendId));
      if (userDoc.exists()) {
        friendUsers.push({
          id: userDoc.id,
          ...userDoc.data()
        });
      }
    }
    
    return friendUsers;
  } catch (error) {
    console.error('Error getting friends:', error);
    throw error;
  }
};

// Get pending friend requests
export const getPendingRequests = async (userId: string) => {
  try {
    // Get requests sent to this user
    const receivedQuery = query(
      collection(db, 'friends'),
      where('friendId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const receivedSnapshot = await getDocs(receivedQuery);
    
    const requests = [];
    
    for (const docSnapshot of receivedSnapshot.docs) {
      const data = docSnapshot.data();
      const senderDoc = await getDoc(doc(db, 'users', data.userId));
      
      if (senderDoc.exists()) {
        requests.push({
          id: docSnapshot.id,
          ...data,
          sender: {
            id: senderDoc.id,
            ...senderDoc.data()
          },
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt
        });
      }
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw error;
  }
};

// Alias for getPendingRequests for compatibility
export const getFriendRequests = getPendingRequests;

// Search users
export const searchUsers = async (query: string) => {
  try {
    // This is a simplified version - in a real app, you would use Firestore queries
    // with proper indexes for name searches or use Cloud Functions with full-text search
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    const users = usersSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => {
        const displayName = user.displayName?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const searchQuery = query.toLowerCase();
        
        return displayName.includes(searchQuery) || email.includes(searchQuery);
      });
    
    // Don't include current user
    const currentUserId = auth.currentUser?.uid;
    return users.filter(user => user.id !== currentUserId);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Send friend request
export const sendFriendRequest = async (friendId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Check if there's already a request
    const existingQuery = query(
      collection(db, 'friends'),
      where('userId', 'in', [userId, friendId]),
      where('friendId', 'in', [userId, friendId])
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('Friend request already exists');
    }
    
    // Create the request
    await addDoc(collection(db, 'friends'), {
      userId,
      friendId,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId: string) => {
  try {
    await updateDoc(doc(db, 'friends', requestId), {
      status: 'accepted'
    });
    
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Reject friend request
export const rejectFriendRequest = async (requestId: string) => {
  try {
    await updateDoc(doc(db, 'friends', requestId), {
      status: 'rejected'
    });
    
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

// Remove friend
export const removeFriend = async (connectionId: string) => {
  try {
    await deleteDoc(doc(db, 'friends', connectionId));
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Search users by school and grade
export const searchUsersBySchoolAndGrade = async (schoolId: string, grade?: string) => {
  try {
    let usersQuery;
    
    if (grade) {
      usersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('grade', '==', grade),
        orderBy('displayName')
      );
    } else {
      usersQuery = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        orderBy('displayName')
      );
    }
    
    const usersSnapshot = await getDocs(usersQuery);
    
    // Don't include current user
    const currentUserId = auth.currentUser?.uid;
    
    return usersSnapshot.docs
      .filter(doc => doc.id !== currentUserId)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

import { db, auth } from '@/config/firebaseConfig';
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
  arrayUnion, 
  arrayRemove, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { Group, GroupMember, GroupPost, GroupComment, GroupResource } from '@/models/group';
import { deleteObject, getStorage, ref } from 'firebase/storage';

const toFirebaseTimestamp = (date: Date | string | null | undefined): any => {
  if (!date) return serverTimestamp();
  
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  
  return serverTimestamp();
};

// Function to create a new group
export const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const groupRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      members: [userId],
      admins: [userId],
    });
    
    return groupRef.id;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Function to get a group by ID
export const getGroup = async (groupId: string): Promise<Group | null> => {
  try {
    const groupDocRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupDocRef);
    
    if (groupDoc.exists()) {
      const groupData = groupDoc.data() as Group;
      return {
        id: groupDoc.id,
        ...groupData,
        createdAt: groupData.createdAt ? (groupData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: groupData.updatedAt ? (groupData.updatedAt as unknown as Timestamp).toDate() : undefined,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
};

// Function to update a group
export const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<void> => {
  try {
    const groupDocRef = doc(db, 'groups', groupId);
    await updateDoc(groupDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

// Function to delete a group
export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    const groupDocRef = doc(db, 'groups', groupId);
    await deleteDoc(groupDocRef);
    
    // TODO: Delete all subcollections (members, posts, resources)
    
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Function to add a member to a group
export const addGroupMember = async (groupId: string, userId: string, role: 'member' | 'admin' = 'member'): Promise<void> => {
  try {
    const membersCollection = collection(db, 'groups', groupId, 'members');
    
    // Check if the user is already a member
    const memberQuery = query(membersCollection, where('userId', '==', userId));
    const memberDocs = await getDocs(memberQuery);
    
    if (memberDocs.size > 0) {
      console.warn(`User ${userId} is already a member of group ${groupId}`);
      return;
    }
    
    await addDoc(membersCollection, {
      userId: userId,
      role: role,
      joinedAt: serverTimestamp(),
    });
    
    // Update the group's members array
    const groupDocRef = doc(db, 'groups', groupId);
    await updateDoc(groupDocRef, {
      members: arrayUnion(userId),
    });
  } catch (error) {
    console.error("Error adding group member:", error);
    throw error;
  }
};

// Function to remove a member from a group
export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  try {
    // Remove from the members subcollection
    const membersCollection = collection(db, 'groups', groupId, 'members');
    const memberQuery = query(membersCollection, where('userId', '==', userId));
    const memberDocs = await getDocs(memberQuery);
    
    memberDocs.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    
    // Update the group's members array
    const groupDocRef = doc(db, 'groups', groupId);
    await updateDoc(groupDocRef, {
      members: arrayRemove(userId),
    });
  } catch (error) {
    console.error("Error removing group member:", error);
    throw error;
  }
};

// Function to get group members
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    const membersCollection = collection(db, 'groups', groupId, 'members');
    const membersSnapshot = await getDocs(membersCollection);
    
    const members: GroupMember[] = [];
    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data();
      
      // Fetch user data
      const userDocRef = doc(db, 'users', memberData.userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        members.push({
          userId: memberData.userId,
          displayName: userData?.displayName || 'Unknown User',
          photoURL: userData?.photoURL,
          role: memberData.role,
          joinedAt: memberData.joinedAt ? (memberData.joinedAt as Timestamp).toDate() : new Date(),
        });
      }
    }
    
    return members;
  } catch (error) {
    console.error("Error fetching group members:", error);
    throw error;
  }
};

// Function to add a post to a group
export const addGroupPost = async (groupId: string, postData: Omit<GroupPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>): Promise<string> => {
  try {
    const postsCollection = collection(db, 'groups', groupId, 'posts');
    const newPostDoc = await addDoc(postsCollection, {
      ...postData,
      createdAt: serverTimestamp(),
      likes: [],
      comments: [],
    });
    return newPostDoc.id;
  } catch (error) {
    console.error("Error adding group post:", error);
    throw error;
  }
};

// Function to get a group post by ID
export const getGroupPost = async (groupId: string, postId: string): Promise<GroupPost | null> => {
  try {
    const postDocRef = doc(db, 'groups', groupId, 'posts', postId);
    const postDoc = await getDoc(postDocRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data() as GroupPost;
      return {
        id: postDoc.id,
        ...postData,
        createdAt: postData.createdAt ? (postData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: postData.updatedAt ? (postData.updatedAt as unknown as Timestamp).toDate() : undefined,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching group post:", error);
    throw error;
  }
};

// Function to update a group post
export const updateGroupPost = async (groupId: string, postId: string, updates: Partial<GroupPost>): Promise<void> => {
  try {
    const postDocRef = doc(db, 'groups', groupId, 'posts', postId);
    await updateDoc(postDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating group post:", error);
    throw error;
  }
};

// Function to delete a group post
export const deleteGroupPost = async (groupId: string, postId: string): Promise<void> => {
  try {
    const postDocRef = doc(db, 'groups', groupId, 'posts', postId);
    await deleteDoc(postDocRef);
    
    // TODO: Delete all subcollections (comments, likes)
    
  } catch (error) {
    console.error("Error deleting group post:", error);
    throw error;
  }
};

// Function to like/unlike a group post
export const togglePostLike = async (groupId: string, postId: string, userId: string): Promise<void> => {
  try {
    const postDocRef = doc(db, 'groups', groupId, 'posts', postId);
    const postDoc = await getDoc(postDocRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const likes: string[] = postData?.likes || [];
      
      if (likes.includes(userId)) {
        // Unlike the post
        await updateDoc(postDocRef, {
          likes: arrayRemove(userId),
        });
      } else {
        // Like the post
        await updateDoc(postDocRef, {
          likes: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
};

// Function to add a comment to a group post
export const addGroupPostComment = async (groupId: string, postId: string, commentData: Omit<GroupComment, 'id' | 'createdAt' | 'updatedAt' | 'likes'>): Promise<string> => {
  try {
    const commentsCollection = collection(db, 'groups', groupId, 'posts', postId, 'comments');
    const newCommentDoc = await addDoc(commentsCollection, {
      ...commentData,
      createdAt: serverTimestamp(),
      likes: [],
    });
    return newCommentDoc.id;
  } catch (error) {
    console.error("Error adding group post comment:", error);
    throw error;
  }
};

// Function to get a comment by ID
export const getGroupPostComment = async (groupId: string, postId: string, commentId: string): Promise<GroupComment | null> => {
  try {
    const commentDocRef = doc(db, 'groups', groupId, 'posts', postId, 'comments', commentId);
    const commentDoc = await getDoc(commentDocRef);
    
    if (commentDoc.exists()) {
      const commentData = commentDoc.data() as GroupComment;
      return {
        id: commentDoc.id,
        ...commentData,
        createdAt: commentData.createdAt ? (commentData.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: commentData.updatedAt ? (commentData.updatedAt as unknown as Timestamp).toDate() : undefined,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching group post comment:", error);
    throw error;
  }
};

// Function to update a group post comment
export const updateGroupPostComment = async (groupId: string, postId: string, commentId: string, updates: Partial<GroupComment>): Promise<void> => {
  try {
    const commentDocRef = doc(db, 'groups', groupId, 'posts', postId, 'comments', commentId);
    await updateDoc(commentDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating group post comment:", error);
    throw error;
  }
};

// Function to delete a group post comment
export const deleteGroupPostComment = async (groupId: string, postId: string, commentId: string): Promise<void> => {
  try {
    const commentDocRef = doc(db, 'groups', groupId, 'posts', postId, 'comments', commentId);
    await deleteDoc(commentDocRef);
    
    // TODO: Delete all subcollections (likes)
    
  } catch (error) {
    console.error("Error deleting group post comment:", error);
    throw error;
  }
};

// Function to like/unlike a group post comment
export const toggleCommentLike = async (groupId: string, postId: string, commentId: string, userId: string): Promise<void> => {
  try {
    const commentDocRef = doc(db, 'groups', groupId, 'posts', postId, 'comments', commentId);
    const commentDoc = await getDoc(commentDocRef);
    
    if (commentDoc.exists()) {
      const commentData = commentDoc.data();
      const likes: string[] = commentData?.likes || [];
      
      if (likes.includes(userId)) {
        // Unlike the comment
        await updateDoc(commentDocRef, {
          likes: arrayRemove(userId),
        });
      } else {
        // Like the comment
        await updateDoc(commentDocRef, {
          likes: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    throw error;
  }
};

// Function to add a resource to a group
export const addGroupResource = async (groupId: string, resourceData: Omit<GroupResource, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const resourcesCollection = collection(db, 'groups', groupId, 'resources');
    const newResourceDoc = await addDoc(resourcesCollection, {
      ...resourceData,
      createdAt: serverTimestamp(),
    });
    return newResourceDoc.id;
  } catch (error) {
    console.error("Error adding group resource:", error);
    throw error;
  }
};

// Function to get a group resource by ID
export const getGroupResource = async (groupId: string, resourceId: string): Promise<GroupResource | null> => {
  try {
    const resourceDocRef = doc(db, 'groups', groupId, 'resources', resourceId);
    const resourceDoc = await getDoc(resourceDocRef);
    
    if (resourceDoc.exists()) {
      const resourceData = resourceDoc.data() as GroupResource;
      return {
        id: resourceDoc.id,
        ...resourceData,
        createdAt: resourceData.createdAt ? (resourceData.createdAt as unknown as Timestamp).toDate() : new Date(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching group resource:", error);
    throw error;
  }
};

// Function to get all resources of a group
export const getGroupResources = async (groupId: string): Promise<GroupResource[]> => {
  try {
    const resourcesCollection = collection(db, 'groups', groupId, 'resources');
    const resourcesSnapshot = await getDocs(resourcesCollection);
    
    const resources: GroupResource[] = resourcesSnapshot.docs.map(doc => {
      const data = doc.data() as GroupResource;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as unknown as Timestamp).toDate() : new Date(),
      };
    });
    
    return resources;
  } catch (error) {
    console.error("Error fetching group resources:", error);
    throw error;
  }
};

// Function to update a group resource
export const updateGroupResource = async (groupId: string, resourceId: string, updates: Partial<GroupResource>): Promise<void> => {
  try {
    const resourceDocRef = doc(db, 'groups', groupId, 'resources', resourceId);
    await updateDoc(resourceDocRef, updates);
  } catch (error) {
    console.error("Error updating group resource:", error);
    throw error;
  }
};

// Function to delete a group resource
export const deleteGroupResource = async (groupId: string, resourceId: string, fileUrl?: string): Promise<void> => {
  try {
    const resourceDocRef = doc(db, 'groups', groupId, 'resources', resourceId);
    await deleteDoc(resourceDocRef);

    // Delete the file from Firebase Storage if a file URL is provided
    if (fileUrl) {
      const storage = getStorage();
      const fileRef = ref(storage, fileUrl);

      try {
        await deleteObject(fileRef);
        console.log("Resource file deleted successfully from storage.");
      } catch (storageError: any) {
        console.error("Error deleting resource file from storage:", storageError.message);
        // Depending on your needs, you might want to rethrow the error or handle it differently
      }
    }
  } catch (error) {
    console.error("Error deleting group resource:", error);
    throw error;
  }
};

// Function to increment the download count of a resource
export const incrementResourceDownloads = async (groupId: string, resourceId: string): Promise<void> => {
  try {
    const resourceDocRef = doc(db, 'groups', groupId, 'resources', resourceId);
    await updateDoc(resourceDocRef, {
      downloads: (downloads: number) => downloads + 1,
    });
  } catch (error) {
    console.error("Error incrementing resource downloads:", error);
    throw error;
  }
};

// Function to get the 5 latest group posts
export const getLatestGroupPosts = async (groupId: string, limitCount: number = 5): Promise<GroupPost[]> => {
  try {
    const postsCollection = collection(db, 'groups', groupId, 'posts');
    const postsQuery = query(
      postsCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    
    const posts: GroupPost[] = postsSnapshot.docs.map(doc => {
      const data = doc.data() as GroupPost;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as unknown as Timestamp).toDate() : undefined,
      };
    });
    
    return posts;
  } catch (error) {
    console.error("Error fetching latest group posts:", error);
    throw error;
  }
};

// Function to get paginated group posts
export const getPaginatedGroupPosts = async (groupId: string, pageSize: number = 10, lastVisiblePost?: GroupPost): Promise<{ posts: GroupPost[], lastVisible: GroupPost | null }> => {
  try {
    const postsCollection = collection(db, 'groups', groupId, 'posts');
    
    let postsQuery = query(
      postsCollection,
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastVisiblePost) {
      postsQuery = query(
        postsCollection,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisiblePost.createdAt as unknown as Timestamp),
        limit(pageSize)
      );
    }
    
    const postsSnapshot = await getDocs(postsQuery);
    
    const posts: GroupPost[] = postsSnapshot.docs.map(doc => {
      const data = doc.data() as GroupPost;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as unknown as Timestamp).toDate() : undefined,
      };
    });
    
    const lastVisible = posts.length > 0 ? posts[posts.length - 1] : null;
    
    return { posts, lastVisible };
  } catch (error) {
    console.error("Error fetching paginated group posts:", error);
    throw error;
  }
};

// Function to get group details with post and member counts
export const getGroupDetailsWithCounts = async (groupId: string): Promise<any> => {
  try {
    const groupDocRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupDocRef);

    if (!groupDoc.exists()) {
      console.log('Group does not exist');
      return null;
    }

    const groupData = groupDoc.data();

    const postCountQuery = await getDocs(
      query(collection(db, 'groups', groupId, 'posts'))
    );
    const postCount = postCountQuery.size;

    const memberCountQuery = await getDocs(
      query(collection(db, 'groups', groupId, 'members'))
    );
    const memberCount = memberCountQuery.size;

    return {
      id: groupDoc.id,
      ...groupData,
      postCount: postCount,
      memberCount: memberCount,
    };
  } catch (error) {
    console.error("Error fetching group details with counts:", error);
    throw error;
  }
};

// Function to get all posts of a group
export const getGroupPosts = async (groupId: string): Promise<GroupPost[]> => {
  try {
    const postsCollection = collection(db, 'groups', groupId, 'posts');
    const postsSnapshot = await getDocs(postsCollection);
    
    const posts: GroupPost[] = postsSnapshot.docs.map(doc => {
      const data = doc.data() as GroupPost;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as unknown as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as unknown as Timestamp).toDate() : undefined,
      };
    });
    
    return posts;
  } catch (error) {
    console.error("Error fetching group posts:", error);
    throw error;
  }
};

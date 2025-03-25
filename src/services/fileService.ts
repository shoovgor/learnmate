import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Function to upload profile picture to Firebase Storage
export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_pictures/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Function to upload a file to a specific folder in Firebase Storage
export const uploadFile = async (file: File, folder: string): Promise<{ url: string, name: string }> => {
  try {
    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      name: file.name
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to get a file reference from a URL
export const getFileRefFromURL = (url: string) => {
  const storage = getStorage();
  return ref(storage, url);
};

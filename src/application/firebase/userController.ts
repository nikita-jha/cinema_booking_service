import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db, auth } from './config';
import { IUser } from '@/domain/user.model';

// Function to create a new user in Firebase Authentication and Firestore
export const registerUser = async (userData: IUser) => {
  const { email, password, firstName, lastName, phone, street, city, state, zip, promotionalEmails } = userData;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email,
      firstName,
      lastName,
      phone,
      address: {
        street,
        city,
        state,
        zip,
      },
      status: 'active',
      promotionalEmails,
    });

    await sendEmailVerification(user);
    console.log(`User created with ID: ${user.uid}, verification email sent.`);
  } catch (error) {
    console.error('Error during user registration:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<IUser[]> => {
  const usersCollectionRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollectionRef);
  return usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<IUser, 'id'>,
  }));
};

export const deleteUser = async (id: string) => {
  try {
    const userDocRef = doc(db, 'users', id);
    await deleteDoc(userDocRef);
    console.log('User deleted with ID:', id);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, user: IUser) => {
  try {
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, user);
    console.log('User updated with ID:', id);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

import { collection, doc, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { IPromotion } from '@/domain/promotion.model';

export const getPromotions = async (): Promise<IPromotion[]> => {
  const promotionsCollectionRef = collection(db, 'promotions');
  const promotionsSnapshot = await getDocs(promotionsCollectionRef);
  return promotionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<IPromotion, 'id'>,
  }));
};

export const addPromotion = async (promotion: IPromotion) => {
  try {
    const docRef = await addDoc(collection(db, 'promotions'), promotion);
    console.log('Promotion added with ID:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding promotion: ', e);
    throw e;
  }
};

export const deletePromotion = async (id: string) => {
  try {
    const promotionDocRef = doc(db, 'promotions', id);
    await deleteDoc(promotionDocRef);
    console.log('Promotion deleted with ID:', id);
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

export const updatePromotion = async (id: string, promotion: IPromotion) => {
  try {
    const promotionDocRef = doc(db, 'promotions', id);
    await updateDoc(promotionDocRef, promotion);
    console.log('Promotion updated with ID:', id);
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

import { collection, doc, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { IPromotion } from '@/domain/promotion.model';

export class PromotionController {
  // Fetch all promotions
  async getPromotions(): Promise<IPromotion[]> {
    const promotionsCollectionRef = collection(db, 'promotions');
    const promotionsSnapshot = await getDocs(promotionsCollectionRef);
    return promotionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<IPromotion, 'id'>,
    }));
  }

  // Add a new promotion
  async addPromotion(promotion: IPromotion) {
    try {
      const docRef = await addDoc(collection(db, 'promotions'), promotion);
      console.log('Promotion added with ID:', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding promotion: ', e);
      throw e;
    }
  }

  // Delete a promotion by ID
  async deletePromotion(id: string) {
    try {
      const promotionDocRef = doc(db, 'promotions', id);
      await deleteDoc(promotionDocRef);
      console.log('Promotion deleted with ID:', id);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }

  // Update a promotion by ID
  async updatePromotion(id: string, promotion: IPromotion) {
    try {
      const promotionDocRef = doc(db, 'promotions', id);
      await updateDoc(promotionDocRef, promotion);
      console.log('Promotion updated with ID:', id);
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }
}

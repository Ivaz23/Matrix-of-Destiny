
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { SavedCalculation } from '../types';

export const useFirestore = (userId: string | undefined) => {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCalculations([]);
      setLoading(false);
      return;
    }

    const path = `users/${userId}/calculations`;
    const q = query(
      collection(db, 'users', userId, 'calculations'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as SavedCalculation);
      setCalculations(docs);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [userId]);

  const saveCalculation = async (calc: SavedCalculation) => {
    if (!userId) return;
    const path = `users/${userId}/calculations/${calc.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'calculations', calc.id);
      await setDoc(docRef, { ...calc, userId });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteCalculation = async (id: string) => {
    if (!userId) return;
    const path = `users/${userId}/calculations/${id}`;
    try {
      const docRef = doc(db, 'users', userId, 'calculations', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return {
    calculations,
    loading,
    saveCalculation,
    deleteCalculation
  };
};


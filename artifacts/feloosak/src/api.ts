import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
  setDoc
} from './firebase';

// Helper to get current user
const getCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user;
};

export const api = {
  auth: {
    login: async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        return { user: { id: userCredential.user.uid, email, ...userDoc.data() } };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    
    register: async (email, password, name, region) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          name,
          region: region || "EG",
          avatar: name.charAt(0).toUpperCase(),
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { user: { id: userCredential.user.uid, email, name, region } };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    
    me: async () => {
      const user = getCurrentUser();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return { user: { id: user.uid, email: user.email, ...userDoc.data() } };
    },
    
    logout: async () => {
      await signOut(auth);
      return { ok: true };
    },
    
    updateProfile: async (data) => {
      const user = getCurrentUser();
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { ...data, updatedAt: new Date().toISOString() });
      return { ok: true };
    },
    
    deleteAccount: async () => {
      const user = getCurrentUser();
      await deleteDoc(doc(db, "users", user.uid));
      await user.delete();
      return { ok: true };
    },
  },
  
  books: {
    list: async () => {
      const user = getCurrentUser();
      const q = query(collection(db, "books"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    create: async (data) => {
      const user = getCurrentUser();
      const docRef = await addDoc(collection(db, "books"), {
        ...data,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    },
    
    update: async (id, data) => {
      const user = getCurrentUser();
      const bookRef = doc(db, "books", id);
      await updateDoc(bookRef, { ...data, updatedAt: new Date().toISOString() });
      return { id, ...data };
    },
    
    delete: async (id) => {
      const user = getCurrentUser();
      await deleteDoc(doc(db, "books", id));
      return { ok: true };
    },
  },
  
  transactions: {
    list: async (bookId) => {
      const user = getCurrentUser();
      const q = query(collection(db, "transactions"), where("bookId", "==", bookId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    create: async (data) => {
      const user = getCurrentUser();
      const docRef = await addDoc(collection(db, "transactions"), {
        ...data,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    },
    
    delete: async (id) => {
      await deleteDoc(doc(db, "transactions", id));
      return { ok: true };
    },
  },
  
  members: {
    list: async (bookId) => {
      const q = query(collection(db, "members"), where("bookId", "==", bookId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    create: async (data) => {
      const docRef = await addDoc(collection(db, "members"), data);
      return { id: docRef.id, ...data };
    },
    
    update: async (id, data) => {
      const memberRef = doc(db, "members", id);
      await updateDoc(memberRef, data);
      return { id, ...data };
    },
    
    delete: async (id) => {
      await deleteDoc(doc(db, "members", id));
      return { ok: true };
    },
  },
  
  customers: {
    list: async () => {
      const user = getCurrentUser();
      const q = query(collection(db, "customers"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    create: async (data) => {
      const user = getCurrentUser();
      const docRef = await addDoc(collection(db, "customers"), {
        ...data,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    },
    
    update: async (id, data) => {
      const customerRef = doc(db, "customers", id);
      await updateDoc(customerRef, data);
      return { id, ...data };
    },
    
    delete: async (id) => {
      await deleteDoc(doc(db, "customers", id));
      return { ok: true };
    },
  },
  
  invoices: {
    list: async () => {
      const user = getCurrentUser();
      const q = query(collection(db, "invoices"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    create: async (data) => {
      const user = getCurrentUser();
      const docRef = await addDoc(collection(db, "invoices"), {
        ...data,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    },
    
    update: async (id, data) => {
      const invoiceRef = doc(db, "invoices", id);
      await updateDoc(invoiceRef, data);
      return { id, ...data };
    },
    
    delete: async (id) => {
      await deleteDoc(doc(db, "invoices", id));
      return { ok: true };
    },
  },
  
  seed: async () => {
    // Optional: Add seed data for testing
    return { message: "Seed not implemented in Firebase version" };
  },
};
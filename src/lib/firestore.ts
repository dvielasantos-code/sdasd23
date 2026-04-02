import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction, Category, Recurrence } from "./types";

// Transações
export async function addTransaction(transaction: Omit<Transaction, "id">) {
  const docRef = await addDoc(collection(db, "transactions"), {
    ...transaction,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function getTransactions(): Promise<Transaction[]> {
  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];
}

export async function deleteTransaction(id: string) {
  await deleteDoc(doc(db, "transactions", id));
}

export async function updateTransaction(id: string, data: Partial<Transaction>) {
  await updateDoc(doc(db, "transactions", id), data);
}

// Categorias custom
export async function addCategory(category: Omit<Category, "id">) {
  const docRef = await addDoc(collection(db, "categories"), category);
  return docRef.id;
}

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, "categories", id));
}

export async function updateCategory(id: string, data: Partial<Category>) {
  await updateDoc(doc(db, "categories", id), data);
}

// Recorrências
export async function addRecurrence(recurrence: Omit<Recurrence, "id">) {
  const docRef = await addDoc(collection(db, "recurrences"), recurrence);
  return docRef.id;
}

export async function getRecurrences(): Promise<Recurrence[]> {
  const snapshot = await getDocs(collection(db, "recurrences"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Recurrence[];
}

export async function deleteRecurrence(id: string) {
  await deleteDoc(doc(db, "recurrences", id));
}

export async function updateRecurrence(id: string, data: Partial<Recurrence>) {
  await updateDoc(doc(db, "recurrences", id), data);
}

// Configurações de tema
export async function saveThemeSettings(settings: { mode: string; primaryColor: string }) {
  const snapshot = await getDocs(collection(db, "settings"));
  if (snapshot.docs.length > 0) {
    await updateDoc(doc(db, "settings", snapshot.docs[0].id), settings);
  } else {
    await addDoc(collection(db, "settings"), settings);
  }
}

export async function getThemeSettings() {
  const snapshot = await getDocs(collection(db, "settings"));
  if (snapshot.docs.length > 0) {
    return snapshot.docs[0].data() as { mode: string; primaryColor: string };
  }
  return null;
}

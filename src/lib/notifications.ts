import { db } from "./firebaseClient";
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, where, getDocs, writeBatch, orderBy } from "firebase/firestore";

export const createNotification = async ({
  senderUuid,
  receiverUuid,
  senderName,
  receiverName,
  type,
  message,
  link,
}: {
  senderUuid: string;
  receiverUuid: string;
  senderName: string;
  receiverName: string;
  type: string;
  message: string;
  link: string;
}) => {
  console.log("Creating notification:", {
    senderUuid,
    receiverUuid,
    senderName,
    receiverName,
    type,
    message,
    link
  });

  const notificationData = {
    senderUuid,
    receiverUuid,
    senderName,
    receiverName,
    type,
    message,
    link,
    read: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "notifications"), notificationData);
  console.log("Notification created with ID:", docRef.id);
  return docRef.id;
};

export const markAllNotificationsRead = async (receiverUuid: string) => {
  const q = query(
    collection(db, "notifications"), 
    where("receiverUuid", "==", receiverUuid), 
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.update(doc(db, "notifications", docSnap.id), { read: true });
  });
  await batch.commit();
};

export const markNotificationRead = async (notificationId: string) => {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
};

export const getNotificationsForUser = async (receiverUuid: string) => {
  const q = query(
    collection(db, "notifications"),
    where("receiverUuid", "==", receiverUuid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date()
  }));
};

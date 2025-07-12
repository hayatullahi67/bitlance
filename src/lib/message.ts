import { db, Timestamp } from "./firebaseClient";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, updateDoc, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { createNotification } from "./notifications";
import { incrementUnreadCount, updateConversation } from "./conversation";

export interface MessageAttachment {
  name: string;
  data: string; // base64 string
  type: string;
  size: number; // bytes
}

export interface Message {
  id?: string;
  conversationId: string;
  jobId: string;
  senderUuid: string;
  senderName: string;
  senderAvatar?: string;
  receiverUuid: string;
  receiverName: string;
  receiverAvatar?: string;
  text: string;
  attachments?: MessageAttachment[];
  readBy: string[];
  createdAt: Timestamp;
  editedAt?: Timestamp;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const isFileSizeValid = (file: File) => file.size <= MAX_FILE_SIZE_BYTES;

// Send a message (with optional base64 attachments)
export const sendMessage = async (data: Omit<Message, "id" | "createdAt" | "readBy" | "isEdited" | "isDeleted">) => {
  const docRef = await addDoc(collection(db, "messages"), {
    ...data,
    readBy: [data.senderUuid],
    createdAt: serverTimestamp(),
    isEdited: false,
    isDeleted: false,
  });

  // Increment unread count for receiver
  await incrementUnreadCount(data.conversationId, data.receiverUuid);

  // Update conversation with last message
  await updateConversation(data.conversationId, {
    lastMessage: {
      text: data.text,
      senderUuid: data.senderUuid,
      senderName: data.senderName,
      receiverUuid: data.receiverUuid,
      receiverName: data.receiverName,
      timestamp: serverTimestamp() as Timestamp,
    },
  });

  // Create notification for the receiver - following the exact same pattern
  try {
    await createNotification({
      senderUuid: data.senderUuid,
      receiverUuid: data.receiverUuid,
      senderName: data.senderName,
      receiverName: data.receiverName,
      type: "new_message",
      message: `${data.senderName} messaged you for this job`,
      link: `/messages?conversation=${data.conversationId}`,
    });
    console.log("Notification created successfully for message");
  } catch (error) {
    console.error("Error creating notification:", error);
  }

  return docRef.id;
};

// Get messages for a conversation
export const getMessagesForConversation = async (conversationId: string) => {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
};

// Mark message as read
export const markMessageAsRead = async (messageId: string, userUuid: string) => {
  const messageRef = doc(db, "messages", messageId);
  const messageDoc = await getDocs(query(collection(db, "messages"), where("__name__", "==", messageId)));
  
  if (!messageDoc.empty) {
    const messageData = messageDoc.docs[0].data() as Message;
    const updatedReadBy = [...new Set([...messageData.readBy, userUuid])];
    
    await updateDoc(messageRef, {
      readBy: updatedReadBy,
    });
  }
};

// Edit a message
export const editMessage = async (messageId: string, newText: string, userUuid: string) => {
  const messageRef = doc(db, "messages", messageId);
  const messageDoc = await getDocs(query(collection(db, "messages"), where("__name__", "==", messageId)));
  
  if (!messageDoc.empty) {
    const messageData = messageDoc.docs[0].data() as Message;
    
    // Check if user is the sender
    if (messageData.senderUuid !== userUuid) {
      throw new Error("You can only edit your own messages");
    }
    
    await updateDoc(messageRef, {
      text: newText,
      editedAt: serverTimestamp(),
      isEdited: true,
    });
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (messageId: string, userUuid: string) => {
  const messageRef = doc(db, "messages", messageId);
  const messageDoc = await getDocs(query(collection(db, "messages"), where("__name__", "==", messageId)));
  
  if (!messageDoc.empty) {
    const messageData = messageDoc.docs[0].data() as Message;
    
    // Check if user is the sender
    if (messageData.senderUuid !== userUuid) {
      throw new Error("You can only delete your own messages");
    }
    
    await updateDoc(messageRef, {
      isDeleted: true,
      text: "This message was deleted",
    });
  }
};

// Real-time messages listener
export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
    callback(messages);
  });
}; 
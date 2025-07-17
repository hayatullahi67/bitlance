import { db, Timestamp } from "./firebaseClient";
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, serverTimestamp, onSnapshot } from "firebase/firestore";
import { sendMessage } from "./message";

export interface Conversation {
  id?: string;
  jobId: string;
  jobTitle?: string;
  clientUuid: string;
  clientName: string;
  clientAvatar?: string;
  freelancerUuid: string;
  freelancerName: string;
  freelancerAvatar?: string;
  lastMessage?: {
    text: string;
    senderUuid: string;
    senderName: string;
    receiverUuid: string;
    receiverName: string;
    timestamp: Timestamp;
  };
  unreadCount: {
    [userUuid: string]: number;
  };
  typingUsers: {
    [userUuid: string]: boolean;
  };
  status: "active" | "archived";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create a new conversation
export const createConversation = async (data: Omit<Conversation, "id" | "createdAt" | "updatedAt">) => {
  const now = serverTimestamp() as Timestamp;
  const docRef = await addDoc(collection(db, "conversations"), {
    ...data,
    createdAt: now,
    updatedAt: now,
    status: "active",
    typingUsers: {},
  });
  return docRef.id;
};

// Get conversations for a user (client or freelancer)
export const getUserConversations = async (userUuid: string) => {
  const q = query(
    collection(db, "conversations"),
    where("status", "==", "active"),
    where("$or", [
      ["clientUuid", "==", userUuid],
      ["freelancerUuid", "==", userUuid]
    ]),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation);
};

// Get a conversation by jobId (for one job)
export const getConversationByJob = async (jobId: string) => {
  const q = query(collection(db, "conversations"), where("jobId", "==", jobId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Conversation;
};

// Update conversation (e.g., lastMessage, unreadCount)
export const updateConversation = async (conversationId: string, data: Partial<Conversation>) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Increment unread count for a user
export const incrementUnreadCount = async (conversationId: string, userUuid: string) => {
  const conversationRef = doc(db, "conversations", conversationId);
  const conversationDoc = await getDoc(conversationRef);
  
  if (conversationDoc.exists()) {
    const conversationData = conversationDoc.data() as Conversation;
    const currentCount = conversationData.unreadCount[userUuid] || 0;
    
    await updateDoc(conversationRef, {
      [`unreadCount.${userUuid}`]: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
  }
};

// Reset unread count for a user
export const resetUnreadCount = async (conversationId: string, userUuid: string) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCount.${userUuid}`]: 0,
    updatedAt: serverTimestamp(),
  });
};

// Set typing indicator
export const setTypingIndicator = async (conversationId: string, userUuid: string, isTyping: boolean) => {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`typingUsers.${userUuid}`]: isTyping,
    updatedAt: serverTimestamp(),
  });
};

// Real-time conversations listener
export const subscribeToConversations = (userUuid: string, callback: (conversations: Conversation[]) => void) => {
  const q1 = query(
    collection(db, "conversations"),
    where("clientUuid", "==", userUuid),
    orderBy("updatedAt", "desc")
  );
  
  const q2 = query(
    collection(db, "conversations"),
    where("freelancerUuid", "==", userUuid),
    orderBy("updatedAt", "desc")
  );
  
  let clientConvs: Conversation[] = [];
  let freelancerConvs: Conversation[] = [];
  
  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    clientConvs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation);
    // Merge and sort by updatedAt
    const allConvs = [...clientConvs, ...freelancerConvs].sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.updatedAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    callback(allConvs);
  });
  
  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    freelancerConvs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation);
    // Merge and sort by updatedAt
    const allConvs = [...clientConvs, ...freelancerConvs].sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.updatedAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    callback(allConvs);
  });
  
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}; 

// Create or get existing conversation for a job
export const createOrGetConversation = async (jobId: string, clientUuid: string, clientName: string, clientAvatar: string, freelancerUuid: string, freelancerName: string, freelancerAvatar: string) => {
  // First check if conversation already exists
  const existingConversation = await getConversationByJob(jobId);
  
  if (existingConversation) {
    return existingConversation.id!;
  }
  
  // Fetch job title from jobs collection
  let jobTitle = `Job ${jobId}`;
  try {
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (jobDoc.exists()) {
      const jobData = jobDoc.data();
      jobTitle = jobData.title || jobTitle;
    }
  } catch (error) {
    console.error("Error fetching job title:", error);
  }
  
  // Create new conversation if it doesn't exist
  const conversationId = await createConversation({
    jobId,
    jobTitle,
    clientUuid,
    clientName,
    clientAvatar,
    freelancerUuid,
    freelancerName,
    freelancerAvatar,
    unreadCount: {},
    typingUsers: {},
  });
  
  return conversationId;
};

// Send first message to start conversation
export const sendFirstMessage = async (
  jobId: string,
  senderUuid: string,
  senderName: string,
  senderAvatar: string,
  receiverUuid: string,
  receiverName: string,
  receiverAvatar: string,
  messageText: string = "Hello! I'd like to discuss this project."
) => {
  // We need to determine who is client and who is freelancer based on the job data
  // Let's fetch the job to get the clientId
  const jobDoc = await getDoc(doc(db, "jobs", jobId));
  if (!jobDoc.exists()) {
    throw new Error("Job not found");
  }
  
  const jobData = jobDoc.data();
  const jobClientId = jobData.clientId;
  
  // Determine who is client and who is freelancer
  let clientUuid: string;
  let clientName: string;
  let clientAvatar: string;
  let freelancerUuid: string;
  let freelancerName: string;
  let freelancerAvatar: string;
  
  if (senderUuid === jobClientId) {
    // Sender is the client, receiver is the freelancer
    clientUuid = senderUuid;
    clientName = senderName;
    clientAvatar = senderAvatar;
    freelancerUuid = receiverUuid;
    freelancerName = receiverName;
    freelancerAvatar = receiverAvatar;
  } else {
    // Sender is the freelancer, receiver is the client
    clientUuid = receiverUuid;
    clientName = receiverName;
    clientAvatar = receiverAvatar;
    freelancerUuid = senderUuid;
    freelancerName = senderName;
    freelancerAvatar = senderAvatar;
  }
  
  // Create or get conversation
  const conversationId = await createOrGetConversation(
    jobId,
    clientUuid,
    clientName,
    clientAvatar,
    freelancerUuid,
    freelancerName,
    freelancerAvatar
  );
  
  // Send the first message
  const messageId = await sendMessage({
    conversationId,
    jobId,
    senderUuid,
    senderName,
    senderAvatar,
    receiverUuid,
    receiverName,
    receiverAvatar,
    text: messageText,
    attachments: [],
  });
  
  return { conversationId, messageId };
}; 
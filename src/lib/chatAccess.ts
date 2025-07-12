import { auth } from "./firebaseClient";
import { Conversation } from "./conversation";

// Check if user has access to a conversation
export const hasConversationAccess = (conversation: Conversation, userUuid: string): boolean => {
  return conversation.clientUuid === userUuid || conversation.freelancerUuid === userUuid;
};

// Get the other user in a conversation
export const getOtherUser = (conversation: Conversation, userUuid: string) => {
  if (conversation.clientUuid === userUuid) {
    return {
      uuid: conversation.freelancerUuid,
      name: conversation.freelancerName,
      avatar: conversation.freelancerAvatar,
    };
  } else {
    return {
      uuid: conversation.clientUuid,
      name: conversation.clientName,
      avatar: conversation.clientAvatar,
    };
  }
};

// Check if current user is authenticated
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

// Get current user info
export const getCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return {
    uuid: user.uid,
    name: user.displayName || user.email || "User",
    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "U")}`,
    email: user.email,
  };
};

// Validate message permissions
export const canEditMessage = (messageSenderUuid: string, currentUserUuid: string): boolean => {
  return messageSenderUuid === currentUserUuid;
};

export const canDeleteMessage = (messageSenderUuid: string, currentUserUuid: string): boolean => {
  return messageSenderUuid === currentUserUuid;
}; 
import React, { useEffect, useState, useRef, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { auth } from "@/lib/firebaseClient";
import { Conversation, subscribeToConversations, resetUnreadCount, setTypingIndicator } from "@/lib/conversation";
import { 
  Message, 
  MessageAttachment, 
  sendMessage, 
  isFileSizeValid, 
  MAX_FILE_SIZE_MB, 
  markMessageAsRead, 
  editMessage, 
  deleteMessage, 
  subscribeToMessages 
} from "@/lib/message";
import { getCurrentUser, hasConversationAccess, getOtherUser, canEditMessage, canDeleteMessage } from "@/lib/chatAccess";
import { 
  getFileTypeCategory, 
  formatFileSize, 
  getFileIcon, 
  createFilePreviewUrl, 
  canPreviewInline 
} from "@/lib/filePreview";
import { useSearchParams } from "react-router-dom";

const Messages = () => {
  const [userType, setUserType] = useState<"client" | "freelancer" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showFilePreview, setShowFilePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchParams] = useSearchParams();

  const currentUser = getCurrentUser();

  // Initialize user data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setUserType(null);
      setLoading(false);
      return;
    }
    setUserName(user.displayName || user.email || "User");
    setUserAvatar(user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || user.email || "U"));
    setUserType("client"); // or "freelancer"; adjust as needed
    setLoading(false);
  }, []);

  // Set initial conversation from URL params
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConvId(conversationId);
    }
  }, [searchParams]);

  // Real-time conversations listener
  useEffect(() => {
    if (!currentUser?.uuid) return;

    const unsubscribe = subscribeToConversations(currentUser.uuid, (convs) => {
      setConversations(convs);
      if (convs.length > 0 && !selectedConvId) {
        setSelectedConvId(convs[0].id!);
      }
    });

    return unsubscribe;
  }, [currentUser?.uuid, selectedConvId]);

  // Real-time messages listener
  useEffect(() => {
    if (!selectedConvId || !currentUser?.uuid) return;

    const unsubscribe = subscribeToMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
      
      // Mark messages as read when conversation is selected
      msgs.forEach(msg => {
        if (msg.senderUuid !== currentUser.uuid && !msg.readBy.includes(currentUser.uuid)) {
          markMessageAsRead(msg.id!, currentUser.uuid);
        }
      });
    });

    return unsubscribe;
  }, [selectedConvId, currentUser?.uuid]);

  // Reset unread count when conversation is selected
  useEffect(() => {
    if (selectedConvId && currentUser?.uuid) {
      resetUnreadCount(selectedConvId, currentUser.uuid);
    }
  }, [selectedConvId, currentUser?.uuid]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    if (!selectedConvId || !currentUser?.uuid) return;

    const handleTyping = () => {
      if (!isTyping) {
        setIsTyping(true);
        setTypingIndicator(selectedConvId, currentUser.uuid, true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingIndicator(selectedConvId, currentUser.uuid, false);
      }, 2000);
    };

    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.addEventListener('input', handleTyping);
      return () => {
        inputElement.removeEventListener('input', handleTyping);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [selectedConvId, currentUser?.uuid, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;
    if (!currentUser?.uuid || !selectedConvId) return;
    
    const conv = conversations.find(c => c.id === selectedConvId);
    if (!conv || !hasConversationAccess(conv, currentUser.uuid)) return;
    
    const otherUser = getOtherUser(conv, currentUser.uuid);
    
    let attachments: MessageAttachment[] = [];
    if (file) {
      if (!isFileSizeValid(file)) {
        setFileError(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      const base64 = await fileToBase64(file);
      attachments.push({
        name: file.name,
        data: base64,
        type: file.type,
        size: file.size,
      });
    }

    try {
      await sendMessage({
        conversationId: selectedConvId,
        jobId: conv.jobId,
        senderUuid: currentUser.uuid,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        receiverUuid: otherUser.uuid,
        receiverName: otherUser.name,
        receiverAvatar: otherUser.avatar,
        text: input,
        attachments,
      });
      
      setInput("");
      setFile(null);
      setFileError("");
      setIsTyping(false);
      setTypingIndicator(selectedConvId, currentUser.uuid, false);
    } catch (error) {
      console.error("Error sending message:", error);
      setFileError("Failed to send message. Please try again.");
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!currentUser?.uuid) return;
    
    try {
      await editMessage(messageId, newText, currentUser.uuid);
      setEditingMessageId(null);
      setEditText("");
    } catch (error) {
      console.error("Error editing message:", error);
      setFileError("Failed to edit message. Please try again.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser?.uuid) return;
    
    try {
      await deleteMessage(messageId, currentUser.uuid);
    } catch (error) {
      console.error("Error deleting message:", error);
      setFileError("Failed to delete message. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!isFileSizeValid(f)) {
        setFileError(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        setFile(null);
        return;
      }
      setFile(f);
    }
  };

  const renderFilePreview = (attachment: MessageAttachment) => {
    const fileType = getFileTypeCategory(attachment.type);
    const previewUrl = createFilePreviewUrl(attachment);

    if (fileType === 'image' && canPreviewInline(attachment.type)) {
      return (
        <div className="mt-2">
          <img 
            src={previewUrl} 
            alt={attachment.name}
            className="max-w-xs max-h-48 rounded cursor-pointer"
            onClick={() => setShowFilePreview(previewUrl)}
          />
        </div>
      );
    }

    return (
      <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 rounded">
        <span className="text-lg">{getFileIcon(attachment.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{attachment.name}</div>
          <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
        </div>
        <a 
          href={previewUrl} 
          download={attachment.name}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Download
        </a>
      </div>
    );
  };

  const renderMessage = (msg: Message) => {
    const isOwnMessage = msg.senderUuid === currentUser?.uuid;
    const canEdit = canEditMessage(msg.senderUuid, currentUser?.uuid || "");
    const canDelete = canDeleteMessage(msg.senderUuid, currentUser?.uuid || "");
    const isRead = msg.readBy.includes(currentUser?.uuid || "");

    return (
      <div
        key={msg.id}
        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3 group`}
      >
        <div className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm relative ${isOwnMessage ? "bg-orange-500 text-white" : "bg-white border"}`}>
          {editingMessageId === msg.id ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="text-black px-2 py-1 rounded border"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMessage(msg.id!, editText)}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setEditText("");
                  }}
                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {msg.isDeleted ? (
                <div className="italic text-gray-400">{msg.text}</div>
              ) : (
                <>
                  <div>{msg.text}</div>
                  {msg.isEdited && (
                    <div className="text-xs text-gray-400 mt-1">(edited)</div>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div>
                      {msg.attachments.map((att, i) => (
                        <div key={i}>
                          {renderFilePreview(att)}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              <div className="flex items-center justify-between mt-1">
                <div className="text-[10px] text-gray-400">
                  {msg.createdAt?.toDate?.().toLocaleTimeString?.() || ""}
                </div>
                {isOwnMessage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && !msg.isDeleted && (
                      <button
                        onClick={() => {
                          setEditingMessageId(msg.id!);
                          setEditText(msg.text);
                        }}
                        className="text-xs hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && !msg.isDeleted && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id!)}
                        className="text-xs hover:underline text-red-400"
                      >
                        Delete
                      </button>
                    )}
                    <span className="text-xs">
                      {isRead ? "✓✓" : "✓"}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const otherUser = selectedConv ? getOtherUser(selectedConv, currentUser?.uuid || "") : null;

  return (
    <Layout
      userType={userType || "client"}
      userName={userName}
      userAvatar={userAvatar}
      title="Messages"
    >
      <div className="flex h-[80vh] bg-white rounded-lg shadow overflow-hidden max-w-5xl mx-auto mt-8 border">
        {/* Sidebar */}
        <div className="w-72 border-r bg-gray-50 flex flex-col">
          <div className="p-4 font-bold text-lg border-b">Chats</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => {
              const otherUserInConv = getOtherUser(conv, currentUser?.uuid || "");
              const unreadCount = conv.unreadCount[currentUser?.uuid || ""] || 0;
              
              return (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition ${selectedConvId === conv.id ? "bg-orange-100" : ""}`}
                  onClick={() => setSelectedConvId(conv.id!)}
                >
                  <div className="relative">
                    <img 
                      src={otherUserInConv.avatar} 
                      alt={otherUserInConv.name} 
                      className="w-10 h-10 rounded-full" 
                    />
                    {conv.typingUsers[otherUserInConv.uuid] && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{otherUserInConv.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {conv.typingUsers[otherUserInConv.uuid] ? "typing..." : conv.lastMessage?.text || "No messages yet"}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedConv && otherUser ? (
            <>
              <div className="flex items-center gap-3 border-b px-6 py-4 bg-white">
                <div className="relative">
                  <img 
                    src={otherUser.avatar} 
                    alt={otherUser.name} 
                    className="w-10 h-10 rounded-full" 
                  />
                  {selectedConv.typingUsers[otherUser.uuid] && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{otherUser.name}</div>
                  <div className="text-xs text-gray-500">
                    {selectedConv.typingUsers[otherUser.uuid] ? "typing..." : "Online"}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="*"
                />
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? file.name : "Attach"}
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Send
                </button>
              </form>
              {fileError && <div className="text-red-500 text-xs px-4 pb-2">{fileError}</div>}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFilePreview(null)}
        >
          <div className="max-w-4xl max-h-4xl">
            <img 
              src={showFilePreview} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

// Utility function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data URL prefix
    };
    reader.onerror = error => reject(error);
  });
}

export default Messages; 
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { sendFirstMessage } from "@/lib/conversation";
import { auth } from "@/lib/firebaseClient";
import { useNavigate } from "react-router-dom";

const TestChat = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sendTestMessage = async () => {
    if (!auth.currentUser) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    try {
      // Send a test message
      const { conversationId } = await sendFirstMessage(
        "test-job-123",
        auth.currentUser.uid, // sender (freelancer)
        auth.currentUser.displayName || auth.currentUser.email || "Test Freelancer",
        auth.currentUser.photoURL || "",
        "test-client-456", // receiver (client)
        "Test Client",
        "https://ui-avatars.com/api/?name=Test+Client",
        "This is a test message to verify notifications work!"
      );

      setMessage(`Test message sent successfully! Conversation ID: ${conversationId}`);
      
      // Navigate to messages after 2 seconds
      setTimeout(() => {
        navigate(`/messages?conversation=${conversationId}`);
      }, 2000);
    } catch (error) {
      console.error("Error sending test message:", error);
      setMessage("Error sending test message: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      userType="client"
      userName="Test User"
      userAvatar=""
      title="Test Chat System"
    >
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Test Chat & Notification System</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Test Message System</h3>
            <p className="text-gray-600 mb-4">
              This will create a test conversation and send a message to verify that:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Conversations are created properly</li>
              <li>Messages are sent and stored</li>
              <li>Notifications are created</li>
              <li>Unread counts are updated</li>
            </ul>
            <Button 
              onClick={sendTestMessage} 
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading ? "Sending..." : "Send Test Message"}
            </Button>
            {message && (
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            )}
          </div>

          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">What to Check:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Check the header for notification badge on chat icon</li>
              <li>Click the bell icon to see the notification</li>
              <li>Click the chat icon to see the conversation</li>
              <li>Verify the message appears in the chat</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestChat; 
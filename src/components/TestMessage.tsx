import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendFirstMessage } from "@/lib/conversation";
import { auth } from "@/lib/firebaseClient";

const TestMessage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendTestMessage = async () => {
    if (!auth.currentUser) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    try {
      // Send a test message using the proper function
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
    } catch (error) {
      console.error("Error sending test message:", error);
      setMessage("Error sending test message: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Test Message System</h3>
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
  );
};

export default TestMessage; 
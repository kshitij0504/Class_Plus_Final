// MessageInput.js
import React, { useState } from "react";

const MessageInput = ({ onSendMessage }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-600">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="w-full p-2 rounded bg-gray-800 text-white"
      />
    </form>
  );
};

export default MessageInput;

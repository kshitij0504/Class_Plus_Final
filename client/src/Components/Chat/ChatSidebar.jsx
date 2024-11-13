import React, { useState, useEffect } from "react";
import axios from "axios";

const ChatSidebar = ({ onSelectFriend, user }) => {
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      const { data } = await axios.get(`http://localhost:8000/api/friends`, {
        withCredentials: true,
      });
      setFriends(data);
    };
    fetchFriends();
  }, [user]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/search?username=${term}`,
        {
          withCredentials: true,
        }
      );
      setSearchResults(data);
    } catch (error) {
      setErrorMessage("Error fetching search results. Please try again.");
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/friendship",
        { friendId },
        {
          withCredentials: true,
        }
      );
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "An error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="w-1/4 bg-darkerGrey p-4 border-r border-gray-600 overflow-y-auto">
      <h2 className="text-lg mb-4 font-semibold">Friends</h2>

      <input
        type="text"
        placeholder="Search Users..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-3 p-2 w-full rounded"
      />

      {errorMessage && (
        <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
      )}

      {searchResults.length > 0 ? (
        <div>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="p-3 flex justify-between rounded hover:bg-gray-700 cursor-pointer"
            >
              <span>{user.username}</span>
              <button
                className="text-blue-500"
                onClick={() => handleAddFriend(user.id)}
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      ) : (
        friends.map((friend) => (
          <div
            key={friend.id}
            className="p-3 rounded hover:bg-gray-700 cursor-pointer"
            onClick={() => onSelectFriend(friend)}
          >
            {friend.username}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatSidebar;

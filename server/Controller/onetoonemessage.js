const prisma = require("../config/connectDb");

// Search for users by username
async function searchPeople(req, res) {
  const { username } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ error: "Username query parameter is required." });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: "insensitive",
        },
      },
      select: { id: true, username: true },
    });

    if (!users.length) {
      return res.status(404).json({ message: "No users found." });
    }

    // Filter out the requesting user if they appear in the results
    const userId = req.user?.id;
    const filteredUsers = users.filter(user => user.id !== userId);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while searching for users." });
  }
}

// Create a friendship
// Updated create friendship
async function friendship(req, res) {
  const { friendId } = req.body;
  const userId = req.user?.id;

  if (!friendId || !userId) {
    return res.status(400).json({ error: "friendId and user authentication are required." });
  }

  if (friendId === userId) {
    return res.status(400).json({ error: "You cannot add yourself as a friend." });
  }

  try {
    // Check if the users are already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ message: "You are already friends." });
    }

    // Create the friendship
    const friendship = await prisma.friendship.create({
      data: { user1Id: userId, user2Id: friendId },
    });

    res.status(201).json(friendship);
  } catch (error) {
    console.error("Error creating friendship:", error);
    res.status(500).json({ error: "An error occurred while creating the friendship." });
  }
}

// Fetch Friends Controller
async function fetchFriends(req, res) {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: { select: { id: true, username: true,avatar: true } },
        user2: { select: { id: true, username: true,avatar: true } },
      },
    });
    console.log(friends)

    // Transform to return the correct friend details for the authenticated user
    const friendList = friends.map((friendship) => {
      const friend =
        friendship.user1Id === userId ? friendship.user2 : friendship.user1;
      return { id: friend.id, username: friend.username,avatar: friend.avatar };
    });

    res.status(200).json(friendList);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "An error occurred while fetching friends." });
  }
}


// Start a chat with a friend
async function startChat(req, res) {
  const { friendId } = req.body;
  const userId = req.user?.id;

  if (!friendId || !userId) {
    return res.status(400).json({ error: "friendId and user authentication are required." });
  }

  try {
    let chatroom = await prisma.chatRoom.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId },
        ],
      },
    });

    if (!chatroom) {
      chatroom = await prisma.chatRoom.create({
        data: { user1Id: userId, user2Id: friendId },
      });
    }

    res.status(200).json(chatroom);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: "An error occurred while starting the chat." });
  }
}

// Send a message in a chat
async function sendMessageOnetoOne(req, res) {
  const { chatRoomId, content } = req.body;
  const senderId = req.user?.id;
  console.log({ chatRoomId, content })

  if (!chatRoomId || !content || !senderId) {
    return res.status(400).json({ error: "chatRoomId, content, and user authentication are required." });
  }

  try {
    const message = await prisma.messageOneToOne.create({
      data: { chatRoomId, senderId, content },
    });

    req.io.to(`room_${chatRoomId}`).emit("new_message", message);
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "An error occurred while sending the message." });
  }
}

// Get messages from a chat room
async function getOnetoOneMessages(req, res) {
  const { chatRoomId } = req.params;

  if (!chatRoomId) {
    return res.status(400).json({ error: "chatRoomId parameter is required." });
  }

  try {
    const messages = await prisma.messageOneToOne.findMany({
      where: { chatRoomId: Number(chatRoomId) },
      orderBy: { sentAt: "asc" },
    });

    // Return empty array with 200 status instead of 404 if you prefer
    if (!messages || !messages.length) {
      return res.status(404).json({ message: "No messages found in this chat room." });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "An error occurred while fetching messages." });
  }
}


module.exports = {
  searchPeople,
  friendship,
  startChat,
  sendMessageOnetoOne,
  getOnetoOneMessages,
  fetchFriends
};

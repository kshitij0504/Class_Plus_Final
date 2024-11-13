const prisma = require("../config/connectDb");

// Middleware to verify group leader status
async function isGroupLeader(req, res, next) {
  const userId = req.user.id;
  console.log(req.user.id);
  const groupId = parseInt(req.params.groupId || req.body.groupId);
  console.log(groupId);

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true }, // Include members to verify membership
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    console.log(group.members);
    // Check if user is group member
    const isMember = group.members.some((member) => member.id === userId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be a group member" });
    }

    // Check if user is group leader
    if (group.leaderId !== userId) {
      return res.status(403).json({
        message: "Only group leaders can perform this action",
      });
    }

    req.group = group; // Attach group to request for later use
    next();
  } catch (error) {
    console.error("Error verifying group leader:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createAnnouncement(req, res) {
  const { title, content, pinned, important, fileUrls } = req.body;
  const userId = req.user.id;
  const groupId = parseInt(req.params.groupId);

  try {
    const announcement = await prisma.$transaction(async (prisma) => {
      const newAnnouncement = await prisma.announcement.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          pinned: Boolean(pinned),
          important: Boolean(important),
          groupId,
          createdBy: userId,
        },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      });

      if (fileUrls?.length > 0) {
        const fileAttachments = fileUrls.map((url) => ({
          fileUrl: url,
          fileName: url.split("/").pop(),
          uploadedBy: userId,
          announcementId: newAnnouncement.id,
        }));

        await prisma.fileAttachment.createMany({ data: fileAttachments });
      }

      return newAnnouncement;
    });

    res.status(201).json({
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllAnnouncements(req, res) {
  const groupId = parseInt(req.params.groupId);
  const { page = 1, limit = 10, pinned } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = { groupId };
    if (pinned !== undefined) {
      where.pinned = pinned === "true";
    }

    const [announcements, total] = await prisma.$transaction([
      prisma.announcement.findMany({
        where,
        include: {
          attachments: true,
          comments: {
            include: {
              user: { select: { username: true, avatar:true } },
            },
          },
          reactions: true,
          user: { select: { username: true, email: true, avatar: true } },
          group: {select: {leaderId: true}}
        },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: parseInt(limit),
      }),
      prisma.announcement.count({ where }),
    ]);

    res.status(200).json({
      message: "Announcements retrieved successfully",
      data: announcements,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateAnnouncement(req, res) {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const { title, content } = req.body;

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (
      announcement.createdBy !== userId &&
      announcement.group.leaderId !== userId
    ) {
      return res.status(403).json({
        message: "Not authorized to update this announcement",
      });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title: title?.trim(),
        content: content?.trim(),
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteAnnouncement(req, res) {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Allow deletion only if user is creator or group leader
    if (
      announcement.createdBy !== userId &&
      announcement.group.leaderId !== userId
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this announcement",
      });
    }

    // Delete associated records first
    await prisma.$transaction([
      prisma.fileAttachment.deleteMany({ where: { announcementId: id } }),
      prisma.comment.deleteMany({ where: { announcementId: id } }),
      prisma.reaction.deleteMany({ where: { announcementId: id } }),
      prisma.mention.deleteMany({ where: { announcementId: id } }),
      prisma.announcement.delete({ where: { id } }),
    ]);

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function toggleAnnouncementPin(req, res) {
  const id = parseInt(req.params.id);
  const { pinStatus } = req.body;

  try {
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: { pinned: Boolean(pinStatus) },
    });

    res.status(200).json({
      message: `Announcement ${pinStatus ? "pinned" : "unpinned"} successfully`,
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Error updating pin status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function addComment(req, res) {
  const announcementId = parseInt(req.params.id);
  const userId = req.user.id;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        announcementId,
        createdBy: userId,
      },
      include: {
        user: { select: { username: true, avatar: true } },
      },
    });

    console.log(newComment)

    res.status(201).json({
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function toggleReaction(req, res) {
  const announcementId = parseInt(req.params.id);
  const userId = req.user.id;
  const { reactionType } = req.body;

  try {
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        announcementId,
        userId,
        type: reactionType,
      },
    });

    if (existingReaction) {
      // Remove reaction if it exists
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return res.status(200).json({ message: "Reaction removed successfully" });
    }

    // Add new reaction
    const newReaction = await prisma.reaction.create({
      data: {
        type: reactionType,
        announcementId,
        userId,
      },
    });

    res.status(201).json({
      message: "Reaction added successfully",
      data: newReaction,
    });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function mentionUser(req, res) {
  const announcementId = parseInt(req.params.id);
  const { mentionedUserId } = req.body;
  console.log(mentionedUserId)

  try {
    const parsedMentionedUserId = parseInt(mentionedUserId);

    const user = await prisma.user.findUnique({
      where: { id: parsedMentionedUserId },
      include: {
        groups: {
          where: { Announcement: { some: { id: announcementId } } }, // Check if the user belongs to a group that has the announcement
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.groups.length === 0) {
      return res
        .status(403)
        .json({ message: "Cannot mention user from different group" });
    }

    const mention = await prisma.mention.create({
      data: {
        announcementId,
        mentionedUserId: parseInt(mentionedUserId),
      },
    });

    res.status(201).json({
      message: "User mentioned successfully",
      data: mention,
    });
  } catch (error) {
    console.error("Error mentioning user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  isGroupLeader,
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPin: toggleAnnouncementPin,
  addComment,
  toggleReaction,
  mentionUser,
};

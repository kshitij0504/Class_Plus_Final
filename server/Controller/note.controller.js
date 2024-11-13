const prisma = require("../config/connectDb");

async function createNote(req, res) {
  try {
    const { title, content, groupId, isPublic } = req.body;
    const groupIdInt = parseInt(groupId);
    const authorId = req.user.id;
    const note = await prisma.note.create({
      data: {
        title,
        content,
        authorId,
        groupId: groupIdInt || null,
        isPublic,
        history: {
          create: {
            content,
            version: 1,
          },
        },
      },
      include: {
        author: true,
        group: true,
      },
    });

    res.status(201).json({
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
}

async function getGroupNotes(req, res) {
  try {
    const { groupId } = req.params;
    const groupIdInt = parseInt(groupId, 10);

    if (isNaN(groupIdInt)) {
      return res.status(400).json({ error: "Invalid groupId" });
    }

    const notes = await prisma.note.findMany({
      where: {
        groupId: groupIdInt,
      },
      include: {
        author: true,
        comment: {
          include: {
            author: true,
          },
        },
      },
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

async function updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.id;
  
      const currentNote = await prisma.note.findUnique({
        where: { id: parseInt(id) },
        include: { author: true, group: true },
      });
  
      if (!currentNote) {
        return res.status(404).json({ error: "Note not found" });
      }
  
      if (currentNote.authorId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this note" });
      }
  
      const updatedNote = await prisma.$transaction(async (prisma) => {
        // Create history record
        await prisma.noteHistory.create({
          data: {
            noteId: parseInt(id),
            content: currentNote.content,
            version: currentNote.version,
          },
        });
  
        // Update the note with incremented version
        return await prisma.note.update({
          where: { id: parseInt(id) },
          data: {
            title,
            content,
            version: currentNote.version + 1,
          },
          include: {
            author: true,
            comment: {
              include: { author: true },
            },
          },
        });
      });
  
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  }
  

async function addNoteComment(req, res) {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    const comment = await prisma.commentNOTES.create({
      data: {
        content,
        authorId,
        noteId: parseInt(noteId),
      },
      include: {
        author: true,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
}

// Get note history
async function getNoteHistory(req, res) {
  try {
    const { noteId } = req.params;
    const noteIdInt = parseInt(noteId, 10);

    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid noteId" });
    }

    const history = await prisma.noteHistory.findMany({
      where: {
        id: noteIdInt,
      },
      orderBy: {
        version: "desc",
      },
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching note history:", error);
    res.status(500).json({ error: "Failed to fetch note history" });
  }
}

module.exports = {
  createNote,
  getGroupNotes,
  updateNote,
  addNoteComment,
  getNoteHistory,
};

const prisma = require('../config/connectDb'); 
exports.createFolder = async (req, res) => {
  const { groupId, name, createdBy, parentId } = req.body;
  
  try {
    const newFolder = await prisma.folder.create({
      data: {
        name,
        groupId: parseInt(groupId, 10),  // Use `groupId` directly
        createdBy,
        parentId,
      },
    });
    res.status(201).json(newFolder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating folder' });
  }
};


// Update folder details
exports.updateFolder = async (req, res) => {
  const { folderId } = req.params;
  const { name } = req.body;

  try {
    const updatedFolder = await prisma.folder.update({
      where: { id: parseInt(folderId) },
      data: { name },
    });
    res.status(200).json(updatedFolder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating folder' });
  }
};

// Delete a folder and cascade delete subfolders and files
exports.deleteFolder = async (req, res) => {
  const { folderId } = req.params;

  try {
    await prisma.folder.delete({
      where: { id: parseInt(folderId) },
    });
    res.status(204).end();
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error deleting folder' });
  }
};

// Get contents of a folder (files and subfolders)
exports.getFolderContents = async (req, res) => {
  const { groupId, folderId } = req.params;

  try {
    const folders = await prisma.folder.findMany({
      where: { parentId: parseInt(folderId), groupId: parseInt(groupId) },
    });
    const files = await prisma.file.findMany({
      where: { folderId: parseInt(folderId), groupId: parseInt(groupId), isDeleted: false },
    });
    res.status(200).json({ folders, files });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folder contents' });
  }
};

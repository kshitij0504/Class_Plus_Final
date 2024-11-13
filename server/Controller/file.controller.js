const prisma = require('../config/connectDb'); 
exports.uploadFile = async (req, res) => {
  const { groupId, folderId, name, fileUrl, fileType, size, createdBy } = req.body;

  try {
    const newFile = await prisma.file.create({
      data: {
        groupId: parseInt(groupId, 10),
        folderId,
        name,
        fileUrl,
        fileType,
        size,
        createdBy,
      },
    });
    res.status(201).json(newFile);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error uploading file' });
  }
};

// Move a file to another folder
exports.moveFile = async (req, res) => {
  const { fileId } = req.params;
  const { folderId } = req.body;

  try {
    const movedFile = await prisma.file.update({
      where: { id: parseInt(fileId) },
      data: { folderId },
    });
    res.status(200).json(movedFile);
  } catch (error) {
    res.status(500).json({ error: 'Error moving file' });
  }
};

exports.deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const deletedFile = await prisma.file.update({
      where: { id: parseInt(fileId) },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    res.status(200).json(deletedFile);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
};

exports.getFiles = async (req, res) => {
  const { groupId, folderId } = req.params;

  try {
    const files = await prisma.file.findMany({
      where: { groupId: parseInt(groupId), folderId: parseInt(folderId), isDeleted: false },
    });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching files' });
  }
};

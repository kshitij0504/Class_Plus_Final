import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
export const uploadFileToFirebase = async (file, chatId) => {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExtension}`;
    const filePath = `chat/${chatId}/${fileName}`;
    const storageRef = ref(storage, filePath);

    await uploadBytesResumable(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      fileUrl: downloadURL,
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

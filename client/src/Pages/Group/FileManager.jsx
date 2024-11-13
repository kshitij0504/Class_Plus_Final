import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FolderPlus,
  MoreVertical,
  File,
  Folder,
  FileText,
  Image,
  Archive,
  Film,
  Music,
  Download,
  Eye,
  ChevronRight,
  ChevronRightIcon,
  Home,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilePreview from "@/Components/fileprieview";
import SearchAndFilter from "@/Components/searchfiler";

const FileManager = () => {
  const { currentUser, token } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
  }));
  const navigate = useNavigate();
  const { id } = useParams();
  const groupId = id;
  console.log(groupId);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileType, setFileType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: null, name: "Root", path: [] },
  ]);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filterContent = useCallback(() => {
    let tempFiles = [...files];
    let tempFolders = [...folders];

    // Search term filter
    if (searchTerm) {
      tempFiles = tempFiles.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      tempFolders = tempFolders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // File type filter
    if (fileType !== "all") {
      tempFiles = tempFiles.filter((file) => {
        switch (fileType) {
          case "image":
            return file.fileType.startsWith("image/");
          case "document":
            return (
              file.fileType.includes("pdf") ||
              file.fileType.includes("document")
            );
          case "video":
            return file.fileType.startsWith("video/");
          case "audio":
            return file.fileType.startsWith("audio/");
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      tempFiles = tempFiles.filter(
        (file) => new Date(file.createdAt) >= filterDate
      );
      tempFolders = tempFolders.filter(
        (folder) => new Date(folder.createdAt) >= filterDate
      );
    }

    setFilteredFiles(tempFiles);
    setFilteredFolders(tempFolders);
  }, [files, folders, searchTerm, fileType, dateRange]);

  useEffect(() => {
    filterContent();
  }, [filterContent, files, folders]);
  // Fetch folder contents
  const fetchFolderContents = async (folderId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/${groupId}/${folderId || "root"}`
      );
      setFolders(response.data.folders);
      setFiles(response.data.files);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load folder contents",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFolderContents(currentFolderId);
  }, [currentFolderId, groupId]);

  // Drag and drop implementation
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          const fileRef = ref(
            storage,
            `groups/${groupId}/${currentFolderId || "root"}/${file.name}`
          );

          await uploadBytes(fileRef, file);
          const fileUrl = await getDownloadURL(fileRef);

          const fileData = {
            groupId,
            folderId: currentFolderId,
            name: file.name,
            fileUrl,
            fileType: file.type,
            size: file.size,
            createdBy: currentUser.id,
          };

          await axios.post("http://localhost:8000/api/upload", fileData);
        }

        fetchFolderContents(currentFolderId);
        toast({
          title: "Success",
          description: "Files uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload files",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [currentFolderId, groupId, currentUser.id]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  // Handle file preview
  const handlePreview = (file) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  // Updated download handler - uses URL directly
  const handleDownload = (file) => {
    try {
      const link = document.createElement("a");
      link.href = file.fileUrl;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of files) {
        const fileRef = ref(
          storage,
          `groups/${groupId}/${currentFolderId || "root"}/${file.name}`
        );

        // Upload file to Firebase storage
        await uploadBytes(fileRef, file);

        // Get download URL from Firebase storage
        const fileUrl = await getDownloadURL(fileRef);

        const fileData = {
          groupId,
          folderId: currentFolderId,
          name: file.name,
          fileUrl,
          fileType: file.type,
          size: file.size,
          createdBy: currentUser.id, // Replace with current user ID from auth
        };

        // Save file metadata to backend
        await axios.post("http://localhost:8000/api/upload", fileData);
      }

      fetchFolderContents(currentFolderId);
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      console.log("Creating folder:", newFolderName); // Debugging line
      const response = await axios.post("http://localhost:8000/api/create", {
        groupId,
        name: newFolderName,
        parentId: currentFolderId,
        createdBy: currentUser.id,
      });

      console.log("Folder created response:", response.data); // Debugging line

      fetchFolderContents(currentFolderId);
      setIsNewFolderOpen(false);
      setNewFolderName("");
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    } catch (error) {
      console.error("Failed to create folder:", error); // Debugging line
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:8000/api/files/delete/${fileId}`);
      fetchFolderContents(currentFolderId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete/${folderId}`);
      toast({
        title: "Success",
        description: "Folder Deleted Successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleFolderClick = async (folder) => {
    const newBreadcrumb = {
      id: folder.id,
      name: folder.name,
      path: [...breadcrumbs.map((b) => b.id)],
    };
    setBreadcrumbs([...breadcrumbs, newBreadcrumb]);
    setCurrentFolderId(folder.id);
  };

  // Updated breadcrumb click handler
  const handleBreadcrumbClick = (crumb, index) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentFolderId(crumb.id);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "application/pdf":
        return <FileText className="w-6 h-6 text-red-500" />;
      case "image/*":
        return <Image className="w-6 h-6 text-blue-500" />;
      case "application/zip":
        return <Archive className="w-6 h-6 text-yellow-500" />;
      case "video/*":
        return <Film className="w-6 h-6 text-purple-500" />;
      case "audio/*":
        return <Music className="w-6 h-6 text-green-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-poppins" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-gray-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg text-center w-full max-w-sm">
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-blue-400 mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-white">
              Drop files here
            </h3>
            <p className="text-blue-300 mt-2 text-sm md:text-base">
              Release to upload files
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="min-h-[4rem] md:h-20 bg-gray-800 shadow-md px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-blue-600 self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            File Manager
          </h1>
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-pink-700 duration-200 border-none md:text-sm"
              onClick={() => setIsNewFolderOpen(true)}
            >
              <FolderPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              New Folder
            </Button>
            <div className="relative">
              <Input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => onDrop(Array.from(e.target.files))}
              />
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-pink-700 duration-200 md:text-sm"
                onClick={() => document.getElementById("file-upload").click()}
                disabled={uploading}
              >
                <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 md:p-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-1 md:space-x-2 mb-4 md:mb-6 bg-gray-800 p-2 md:p-3 rounded-lg overflow-x-auto whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 min-w-fit"
            onClick={() => handleBreadcrumbClick({ id: null, name: "Root" }, 0)}
          >
            <Home className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          {breadcrumbs.slice(1).map((item, index) => (
            <div key={item.id} className="flex items-center min-w-fit">
              <ChevronRightIcon className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 text-blue-400" />
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs md:text-sm ${
                  index === breadcrumbs.length - 2
                    ? "text-white font-medium"
                    : "text-blue-400 hover:text-blue-300"
                }`}
                onClick={() => handleBreadcrumbClick(item, index + 1)}
              >
                {item.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Files and folders grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {filteredFolders.map((folder) => (
            <Card
              key={folder.id}
              className="bg-gray-800 hover:bg-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer border-purple-500/30"
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                    <Folder className="w-5 h-5 md:w-6 md:h-6 text-purple-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-white truncate">
                      {folder.name}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 md:h-8 md:w-8 p-0 text-purple-400 hover:text-purple-300 flex-shrink-0"
                      >
                        <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-purple-500/30">
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Files list */}
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-blue-500/30">
          {/* Table header - Hide on mobile */}
          <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-750 text-sm font-medium text-white">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Modified</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Mobile and desktop file items */}
          {filteredFiles.map((file) => (
            <div key={file.id}>
              {/* Mobile view */}
              <div className="md:hidden p-4 hover:bg-gray-700 border-t border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    {getFileIcon(file.fileType)}
                    <span className="font-medium text-white text-sm truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-green-400 hover:text-green-300"
                      onClick={() => handlePreview(file)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-blue-500/30">
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-300">
                  <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 px-6 py-4 hover:bg-gray-700 items-center text-sm border-t border-blue-500/20">
                <div className="col-span-6 flex items-center space-x-3 min-w-0">
                  {getFileIcon(file.fileType)}
                  <span className="font-medium text-white truncate">
                    {file.name}
                  </span>
                </div>
                <div className="col-span-2 text-blue-300">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
                <div className="col-span-2 text-blue-300">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-300 hover:bg-gray-700"
                    onClick={() => handlePreview(file)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-blue-500/30">
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl bg-gray-800 border-blue-500/30 mx-4 md:mx-auto">
          <FilePreview
            file={previewFile}
            onClose={() => setIsPreviewOpen(false)}
            onDelete={() => {
              handleDeleteFile(previewFile.id);
              setIsPreviewOpen(false);
            }}
            onDownload={() => handleDownload(previewFile)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-purple-500/30 mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="p-4 md:p-6">
            <Input
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mb-6 bg-gray-700 border-purple-500/30 text-white placeholder:text-purple-300"
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsNewFolderOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white border-purple-500/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;

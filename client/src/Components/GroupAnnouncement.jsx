import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Pin,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  Edit,
  Trash2,
  MoreVertical,
  Paperclip,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useSelector } from "react-redux";
import AttachmentViewer from "./Announcement/AttachmentViewer";
import Reply from "./Announcement/Reply";
import NewPostCard from "./Announcement/NewPostCard";

const GroupAnnouncements = () => {
  const { id } = useParams();
  const groupId = id;
  const { currentUser } = useSelector((state) => ({
    currentUser: state.user.currentUser,
  }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingAttachment, setViewingAttachment] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    pinned: false,
    important: false,
    fileUrls: [],
    fileNames: [],
  });

  const fetchAnnouncements = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/groups/${groupId}/announcements`,
        {
          params: { page, limit: 10 },
          withCredentials: true,
        }
      );

      console.log(response.data.data);
      setAnnouncements(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      toast.error("Failed to fetch announcements");
      setError("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [groupId]);

  const resetNewPost = () => {
    setNewPost({
      title: "",
      content: "",
      pinned: false,
      important: false,
      fileUrls: [],
      fileNames: [],
    });
    setEditingAnnouncement(null);
  };

  const handleAddReply = async (announcementId) => {
    try {
      const content = replyContent[announcementId];
      if (!content?.trim()) return;

      await axios.post(
        `http://localhost:8000/api/announcements/${announcementId}/comments`,
        { content },
        { withCredentials: true }
      );

      setReplyContent({ ...replyContent, [announcementId]: "" });
      fetchAnnouncements(currentPage);
      toast.success("Reply added successfully");
    } catch (err) {
      toast.error("Failed to add reply");
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await axios.delete(`http://localhost:8000/api/replies/${replyId}`, {
        withCredentials: true,
      });
      fetchAnnouncements(currentPage);
      toast.success("Reply deleted successfully");
    } catch (err) {
      toast.error("Failed to delete reply");
    }
  };

  const handlePost = async () => {
    try {
      const payload = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        pinned: newPost.pinned,
        important: newPost.important,
        fileUrls: newPost.fileUrls,
      };

      if (editingAnnouncement) {
        await axios.put(
          `http://localhost:8000/api/groups/${groupId}/announcements/${editingAnnouncement.id}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Announcement updated successfully");
      } else {
        await axios.post(
          `http://localhost:8000/api/groups/${groupId}/announcements`,
          payload,
          { withCredentials: true }
        );
        toast.success("Announcement posted successfully");
      }

      setIsDialogOpen(false);
      resetNewPost();
      fetchAnnouncements(currentPage);
    } catch (err) {
      toast.error("Failed to post announcement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await axios.delete(
          `http://localhost:8000/api/groups/${groupId}/announcements/${id}`,
          {
            withCredentials: true,
          }
        );
        fetchAnnouncements(currentPage);
        toast.success("Announcement deleted successfully");
      } catch (err) {
        toast.error("Failed to delete announcement");
      }
    }
  };

  const handleTogglePin = async (id, currentPinStatus) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/groups/${groupId}/announcements/${id}/pin`,
        {
          pinStatus: !currentPinStatus,
        },
        {
          withCredentials: true,
        }
      );
      fetchAnnouncements(currentPage);
      toast.success(
        `Announcement ${currentPinStatus ? "unpinned" : "pinned"} successfully`
      );
    } catch (err) {
      toast.error("Failed to update pin status");
    }
  };

  const handleReaction = async (id) => {
    try {
      await axios.post(
        `http://localhost:8000/api/announcements/${id}/reactions`,
        {
          reactionType: "LIKE",
        },
        {
          withCredentials: true,
        }
      );
      fetchAnnouncements(currentPage);
      toast.success("Reaction added successfully");
    } catch (err) {
      toast.error("Failed to update reaction");
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewPost({
      title: announcement.title,
      content: announcement.content,
      pinned: announcement.pinned,
      important: announcement.important,
      fileUrls: announcement.attachments?.map((a) => a.fileUrl) || [],
      fileNames: announcement.attachments?.map((a) => a.fileName) || [],
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    for (const file of files) {
      const originalName = file.name;
      const storageRef = ref(storage, `attachments/${originalName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload for ${originalName} is ${progress}% done`);
        },
        (error) => {
          console.error(`Upload for ${originalName} failed:`, error);
          toast.error(`Failed to upload ${originalName}`);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          function getFileNameFromFirebaseUrl(downloadURL) {
            // This assumes the URL ends with the filename after the last '/'
            const decodedUrl = decodeURIComponent(downloadURL); // Decodes any special characters in the URL
            return decodedUrl
              .substring(decodedUrl.lastIndexOf("/") + 1)
              .split("?")[0];
          }
          const file_Name = getFileNameFromFirebaseUrl(downloadURL);
          console.log(file_Name);
          setNewPost((prevState) => ({
            ...prevState,
            fileUrls: [...prevState.fileUrls, downloadURL],
            fileNames: [...prevState.fileNames, file_Name],
          }));
        }
      );
    }
  };

  const handleFileView = (url, fileName) => {
    setViewingAttachment({ url, fileName });
  };

  const handleFileDelete = (index) => {
    const fileUrls = [...newPost.fileUrls];
    const fileNames = [...newPost.fileNames];
    fileUrls.splice(index, 1);
    fileNames.splice(index, 1);
    setNewPost({ ...newPost, fileUrls, fileNames });
  };

  const handleFileDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-poppins">
    <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
            Group Announcements
          </h1>
        </div>
      </div>

      {/* New Post Card */}
      <div className="mb-6">
        <NewPostCard
          avatar={currentUser.avatar}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>

      {/* Create/Edit Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 m-4 sm:m-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800">
              {editingAnnouncement ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Add a subject"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="text-base sm:text-lg bg-gray-100"
            />
            <Textarea
              placeholder="Write your message here..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="bg-gray-100"
            />

            {/* Attachments Preview */}
            {newPost.fileUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newPost.fileUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-200 px-2 sm:px-3 py-1 rounded-full text-sm"
                  >
                    <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">
                      {newPost.fileNames[index]}
                    </span>
                    <button onClick={() => handleFileDelete(index)}>
                      <X className="w-3 h-3 sm:w-4 sm:h-4 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={newPost.pinned ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setNewPost({ ...newPost, pinned: !newPost.pinned })}
                  className="flex-1 sm:flex-none"
                >
                  <Pin className="w-4 h-4 mr-2" />
                  Pin
                </Button>
                <Button
                  variant={newPost.important ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setNewPost({ ...newPost, important: !newPost.important })}
                  className="flex-1 sm:flex-none"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Important
                </Button>
                <label className="flex items-center justify-center flex-1 sm:flex-none px-3 py-1 rounded-md border cursor-pointer hover:bg-gray-100">
                  <Paperclip className="w-4 h-4 mr-2" />
                  <span>Attach</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <Button
                onClick={handlePost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {editingAnnouncement ? "Update" : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Announcements List */}
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        {loading && announcements.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="p-4 bg-gray-100 border border-gray-300 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Announcement Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <img
                      src={announcement.user?.avatar || ""}
                      alt={announcement.user?.name || "User Avatar"}
                      className="h-full w-full object-cover rounded-full"
                    />
                    <AvatarFallback>{announcement.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {announcement.user?.username}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {announcement.important && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Important
                    </span>
                  )}
                  {announcement.pinned && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePin(announcement.id, announcement.pinned)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {announcement.pinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Announcement Content */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {announcement.title}
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap mb-4 text-sm sm:text-base">
                {announcement.content}
              </p>

              {/* Attachments */}
              {announcement.attachments?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {announcement.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-200 p-2 sm:px-3 rounded-lg sm:rounded-full"
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-0">
                        <Paperclip className="w-4 h-4 text-gray-600" />
                        <span className="text-sm truncate max-w-[200px] text-gray-700">
                          {decodeURIComponent(attachment?.fileName || "").split("/").pop().split("?")[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="link"
                          onClick={() => handleFileView(attachment.fileUrl, attachment.fileName)}
                          className="flex-1 sm:flex-none text-blue-600 hover:underline"
                        >
                          View
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleFileDownload(attachment.fileUrl, attachment.fileName)}
                          className="flex-1 sm:flex-none text-green-600 hover:underline"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reactions and Comments */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-300 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(announcement.id)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {announcement.reactions?.length || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies({
                    ...showReplies,
                    [announcement.id]: !showReplies[announcement.id]
                  })}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {announcement.comments?.length || 0}
                  {showReplies[announcement.id] ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </div>

              {/* Comments Section */}
              {showReplies[announcement.id] && (
                <div className="mt-4 space-y-4">
                  {announcement.comments?.map((reply) => (
                    <Reply
                      key={reply.id}
                      reply={reply}
                      onDelete={handleDeleteReply}
                    />
                  ))}
                  <div className="pl-4 sm:pl-12 flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent[announcement.id] || ""}
                        onChange={(e) => setReplyContent({
                          ...replyContent,
                          [announcement.id]: e.target.value
                        })}
                        className="min-h-[80px] mb-2"
                      />
                      <Button
                        onClick={() => handleAddReply(announcement.id)}
                        disabled={!replyContent[announcement.id]?.trim()}
                        className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 mr-2" /> Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6 pb-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => fetchAnnouncements(currentPage - 1)}
              className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => fetchAnnouncements(page)}
                  className={`hidden sm:block w-8 h-8 p-0 ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-600"
                  }`}
                >
                  {page}
                </Button>
              ))}
              <span className="text-sm text-gray-500 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => fetchAnnouncements(currentPage + 1)}
              className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2"
            >
              Next
            </Button>
          </div>
        )}

        {/* Attachment Viewer Dialog */}
        {viewingAttachment && (
          <Dialog open={true} onOpenChange={() => setViewingAttachment(null)}>
            <DialogContent className="w-[95vw] sm:max-w-4xl h-[90vh] p-0">
              <div className="h-full flex flex-col">
                <DialogHeader className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold truncate pr-4">
                      {decodeURIComponent(viewingAttachment.fileName || "")
                        .split("/")
                        .pop()
                        .split("?")[0]}
                    </DialogTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingAttachment(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-4">
                  <AttachmentViewer
                    url={viewingAttachment.url}
                    fileName={viewingAttachment.fileName}
                    onClose={() => setViewingAttachment(null)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default GroupAnnouncements;

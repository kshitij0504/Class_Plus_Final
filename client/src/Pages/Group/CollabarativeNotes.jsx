import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import {
  Edit,
  History,
  MessageSquare,
  Plus,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
const CollaborativeNotes = () => {
  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [noteHistory, setNoteHistory] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [expandedNotes, setExpandedNotes] = useState({});

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    isPublic: true,
  });

  useEffect(() => {
    fetchNotes();
  }, [groupId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `https://class-plus-final.onrender.com/api/group/${groupId}/notes`,
        { withCredentials: true }
      );
      console.log(response);
      setNotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await axios.post(
        "https://class-plus-final.onrender.com/api/group/note",
        { ...newNote, groupId },
        { withCredentials: true }
      );
      setNotes([response.data.data, ...notes]);
      setShowNewNote(false);
      setNewNote({ title: "", content: "", isPublic: true });
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    try {
      const response = await axios.put(
        `https://class-plus-final.onrender.com/api/group/${groupId}/${noteId}`,
        updatedData,
        { withCredentials: true }
      );
      setNotes(
        notes.map((note) => (note.id === noteId ? response.data : note))
      );
      setSelectedNote(null);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleAddComment = async (noteId) => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `https://class-plus-final.onrender.com/api/group/${noteId}/comments`,
        { content: newComment },
        { withCredentials: true }
      );

      setNotes(
        notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              comments: [...(note.comments || []), response.data],
            };
          }
          return note;
        })
      );

      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const fetchNoteHistory = async (noteId) => {
    try {
      const response = await axios.get(
        `https://class-plus-final.onrender.com/api/group/${noteId}/history`,
        { withCredentials: true }
      );
      setNoteHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error("Failed to fetch note history:", error);
    }
  };

  const getAuthorInitials = (author) => {
    if (!author || !author.username) return "U"; // U for Unknown
    return author.username.charAt(0) || "U";
  };

  const getAuthorName = (author) => {
    if (!author || !author.username) return "Unknown User";
    return author.username;
  };

  // Helper function to safely get author avatar
  const getAuthorAvatar = (author) => {
    if (!author || !author.avatar) return null;
    return author.avatar;
  };

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const renderNoteContent = (note) => {
    const isExpanded = expandedNotes[note.id];
    const maxLength = 200;
    const needsExpansion = note.content.length > maxLength;

    if (!needsExpansion) return note.content;

    return (
      <>
        {isExpanded ? note.content : `${note.content.slice(0, maxLength)}...`}
        <Button
          variant="link"
          className="text-blue-500 hover:text-blue-600 p-0 h-auto font-medium"
          onClick={() => toggleNoteExpansion(note.id)}
        >
          {isExpanded ? "Show less" : "Read more"}
        </Button>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-600 self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent text-center">
          Collaborative Notes
        </h2>
        <Button
          onClick={() => setShowNewNote(true)}
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 sm:px-6 self-end sm:self-auto"
        >
          <Plus className="h-5 w-5" /> Create Note
        </Button>
      </div>

      {/* Notes Grid Section - Scrollable */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 pb-8">
        <ScrollArea className="h-[calc(100vh-180px)]">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[600px]">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {Array.isArray(notes) &&
                notes.map((note) => (
                  <Card
                    key={note?.id || Math.random()}
                    className="flex flex-col h-[600px] shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardHeader className="flex-none pb-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-3 w-full sm:w-auto">
                          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                            {note?.title || "Untitled Note"}
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-2 ring-purple-500/20">
                              <AvatarImage
                                src={getAuthorAvatar(note?.author)}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                {getAuthorInitials(note?.author)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700">
                                {getAuthorName(note?.author)}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(note?.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end sm:self-start">
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-purple-50"
                            onClick={() =>
                              note?.id && fetchNoteHistory(note.id)
                            }
                          >
                            <History className="h-4 w-4 text-purple-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-blue-50"
                            onClick={() => note && setSelectedNote(note)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow pb-4">
                      <ScrollArea className="h-[280px] pr-4">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed">
                            {note?.content
                              ? renderNoteContent(note)
                              : "No content"}
                          </p>
                        </div>
                      </ScrollArea>
                    </CardContent>

                    <CardFooter className="flex-none border-t pt-4">
                      <div className="w-full space-y-4">
                        <ScrollArea className="h-[120px]">
                          <div className="space-y-3 pr-4">
                            {Array.isArray(note?.comment) &&
                              note.comment.map((comment) => (
                                <div
                                  key={comment?.id || Math.random()}
                                  className="flex gap-3"
                                >
                                  <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarImage
                                      src={getAuthorAvatar(comment?.author)}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                      {getAuthorInitials(comment?.author)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                      <p className="text-sm text-gray-700 break-words">
                                        {comment?.content || "No content"}
                                      </p>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {new Date(
                                        comment?.createdAt
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && note?.id) {
                                  handleAddComment(note.id);
                                }
                              }}
                              className="focus-visible:ring-purple-500"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="hover:bg-purple-50 flex-shrink-0"
                              onClick={() =>
                                note?.id && handleAddComment(note.id)
                              }
                            >
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                            </Button>
                          </div>
                        </ScrollArea>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Dialogs - Made responsive */}
      <Dialog open={showNewNote} onOpenChange={setShowNewNote}>
        <DialogContent className="sm:max-w-[600px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Create New Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Input
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) =>
                setNewNote({ ...newNote, title: e.target.value })
              }
              className="text-lg font-medium"
            />
            <Textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) =>
                setNewNote({ ...newNote, content: e.target.value })
              }
              rows={8}
              className="resize-none"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewNote(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNote}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog - Made responsive */}
      <Dialog
        open={!!selectedNote}
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <DialogContent className="sm:max-w-[500px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Edit Note
            </DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <Input
                value={selectedNote.title}
                onChange={(e) =>
                  setSelectedNote({ ...selectedNote, title: e.target.value })
                }
              />
              <Textarea
                value={selectedNote.content}
                onChange={(e) =>
                  setSelectedNote({ ...selectedNote, content: e.target.value })
                }
                rows={6}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedNote(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateNote(selectedNote.id, {
                      title: selectedNote.title,
                      content: selectedNote.content,
                    })
                  }
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog - Made responsive */}
      <Dialog
        open={showHistory}
        onOpenChange={(open) => !open && setShowHistory(false)}
      >
        <DialogContent className="sm:max-w-[500px] w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Note History
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <div className="space-y-4">
              {noteHistory.map((version) => (
                <div key={version.id} className="rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Version {version.version}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words">
                    {version.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaborativeNotes;

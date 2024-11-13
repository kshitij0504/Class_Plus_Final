import React, { useState } from "react";
import {
  Share,
  Download,
  Pencil,
  Star,
  Copy,
  Trash,
  ExternalLink,
} from "lucide-react";
import { Button } from "flowbite-react";

const FilePreview = ({ file, onClose, onDelete, onDownload }) => {
  const [isStarred, setIsStarred] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.fileUrl);
      toast({
        title: "Success",
        description: "File link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] max-h-[900px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 border-b border-blue-500/30 gap-3 sm:gap-0">
        <h2 className="text-lg md:text-xl font-semibold text-white truncate max-w-[calc(100%-2rem)] sm:max-w-[60%]">
          {file.name}
        </h2>
        <div className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-400 hover:text-yellow-300 p-1.5 md:p-2"
            onClick={() => setIsStarred(!isStarred)}
          >
            <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 p-1.5 md:p-2"
            onClick={handleCopyLink}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-300 p-1.5 md:p-2"
            onClick={() => window.open(file.fileUrl, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 p-1.5 md:p-2"
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 p-1.5 md:p-2"
            onClick={onDelete}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-900 p-3 md:p-4 overflow-auto">
        <div className="h-full flex items-center justify-center min-h-[200px]">
          {file.fileType.startsWith("image/") ? (
            <img
              src={file.fileUrl}
              alt={file.name}
              className="max-w-full max-h-[calc(100vh-20rem)] md:max-h-[calc(100vh-24rem)] object-contain"
            />
          ) : file.fileType.startsWith("video/") ? (
            <video
              controls
              className="max-w-full max-h-[calc(100vh-20rem)] md:max-h-[calc(100vh-24rem)]"
              src={file.fileUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : file.fileType.startsWith("audio/") ? (
            <audio 
              controls 
              className="w-full max-w-md mt-4" 
              src={file.fileUrl}
            >
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <iframe
              src={file.fileUrl}
              className="w-full h-full min-h-[calc(100vh-24rem)] md:min-h-[calc(100vh-28rem)]"
              title={file.name}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 bg-gray-800 border-t border-blue-500/30">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-blue-300 text-xs md:text-sm">Uploaded</p>
            <p className="text-white text-sm md:text-base truncate">
              {new Date(file.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-blue-300 text-xs md:text-sm">Size</p>
            <p className="text-white text-sm md:text-base">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
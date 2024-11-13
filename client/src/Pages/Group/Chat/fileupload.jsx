import React, { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, File, Maximize2, Minimize2 } from 'lucide-react';

const FilePreview = ({ fileUrl, fileName, fileType, onRemove }) => {
  const [showModal, setShowModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-400" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-400" />;
    } else {
      return <File className="h-6 w-6 text-gray-400" />;
    }
  };

  const getFileTypeLabel = () => {
    if (fileType.startsWith('image/')) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF Document';
    } else {
      return fileType.split('/')[1]?.toUpperCase() || 'Document';
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const FilePreviewCard = () => (
    <div
      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all duration-200 cursor-pointer"
      onClick={() => setShowModal(true)}
    >
      {fileType.startsWith('image/') ? (
        <div className="relative aspect-video">
          <img
            src={fileUrl}
            alt={fileName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-8 h-8 text-white" />
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-center gap-3">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-white truncate">{fileName}</p>
            <p className="text-sm text-gray-400">{getFileTypeLabel()}</p>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleDownload}
          className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200"
          aria-label="Download file"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <FilePreviewCard />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div
            className={`relative bg-gray-900 rounded-lg ${
              isFullscreen ? 'w-screen h-screen' : 'max-w-4xl max-h-[90vh] m-4'
            }`}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-full overflow-auto p-4">
              {fileType.startsWith('image/') ? (
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: 'calc(100vh - 2rem)' }}
                />
              ) : fileType === 'application/pdf' ? (
                <iframe
                  src={`${fileUrl}#view=fit`}
                  title={fileName}
                  className="w-full h-full min-h-[80vh]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                  {getFileIcon()}
                  <p className="text-lg text-white">{fileName}</p>
                  <p className="text-sm text-gray-400">{getFileTypeLabel()}</p>
                  <a
                    href={fileUrl}
                    download={fileName}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;